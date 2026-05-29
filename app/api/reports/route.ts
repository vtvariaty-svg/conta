import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifySessionToken } from "@/lib/services/auth";
import type { ReportData, ProductRanking } from "@/lib/types";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifySessionToken(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getAdminDb();

  const [ordersSnap, productsSnap] = await Promise.all([
    db.collection("orders").get(),
    db.collection("products").get(),
  ]);

  let grossRevenue = 0;
  let paidOrders = 0;
  let pendingOrders = 0;
  let canceledOrders = 0;
  let totalCost = 0;
  let estimatedProfit = 0;
  let manualDeliveryPending = 0;

  const productMap: Record<string, ProductRanking> = {};

  for (const orderDoc of ordersSnap.docs) {
    const order = orderDoc.data();

    if (order.paymentStatus === "paid") {
      paidOrders++;
      grossRevenue += order.totalAmount ?? 0;
      totalCost += order.productCost ?? 0;
      estimatedProfit += order.estimatedProfit ?? 0;

      if (order.deliveryStatus === "manual_required") {
        manualDeliveryPending++;
      }

      const itemsSnap = await orderDoc.ref.collection("items").get();
      for (const itemDoc of itemsSnap.docs) {
        const item = itemDoc.data();
        const key = item.productId as string;
        if (!productMap[key]) {
          productMap[key] = {
            productId: key,
            productName: item.productNameSnapshot ?? "",
            revenue: 0,
            profit: 0,
            soldCount: 0,
          };
        }
        productMap[key].revenue += item.totalPrice ?? 0;
        productMap[key].profit += (item.totalPrice ?? 0) - (item.totalCost ?? 0);
        productMap[key].soldCount += item.quantity ?? 0;
      }
    } else if (order.paymentStatus === "pending") {
      pendingOrders++;
    } else if (["canceled", "expired", "failed"].includes(order.paymentStatus)) {
      canceledOrders++;
    }
  }

  const estimatedMargin = grossRevenue > 0 ? estimatedProfit / grossRevenue : 0;
  const rankings = Object.values(productMap);

  const topProductsByRevenue = [...rankings]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const topProductsByProfit = [...rankings]
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 10);

  const lowStockProducts = productsSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((p: any) => p.status === "active" && p.stock <= 3);

  const pausedProducts = productsSnap.docs.filter(
    (d) => d.data().status === "paused"
  ).length;

  const report: ReportData = {
    grossRevenue,
    paidOrders,
    pendingOrders,
    canceledOrders,
    totalCost,
    estimatedProfit,
    estimatedMargin,
    topProductsByRevenue,
    topProductsByProfit,
    lowStockProducts: lowStockProducts as any,
    pausedProducts,
    manualDeliveryPending,
  };

  return NextResponse.json(report);
}
