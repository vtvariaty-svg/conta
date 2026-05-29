import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

// Public route: customer checks their own order status
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getAdminDb();
  const snap = await db.collection("orders").doc(id).get();

  if (!snap.exists) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const order = snap.data()!;

  // Only expose safe fields to the public
  const deliveriesSnap = await db
    .collection("orders")
    .doc(id)
    .collection("deliveries")
    .where("status", "==", "delivered")
    .limit(1)
    .get();

  const delivery = deliveriesSnap.empty
    ? null
    : { id: deliveriesSnap.docs[0].id, ...deliveriesSnap.docs[0].data() };

  return NextResponse.json({
    id,
    orderNumber: order.orderNumber,
    paymentStatus: order.paymentStatus,
    deliveryStatus: order.deliveryStatus,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    delivery,
  });
}
