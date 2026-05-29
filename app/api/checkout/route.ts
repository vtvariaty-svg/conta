import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { mockPaymentProvider } from "@/lib/providers/payment";
import { emailProvider } from "@/lib/providers/email/mock";
import { generateOrderNumber } from "@/lib/utils/format";
import type { OrderDoc, ProductDoc } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, customerName, customerEmail, customerPhone } = body;

    if (!productId || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = getAdminDb();
    const productSnap = await db.collection("products").doc(productId).get();

    if (!productSnap.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = { id: productSnap.id, ...productSnap.data() } as ProductDoc;

    if (product.status !== "active") {
      return NextResponse.json({ error: "Product is not available for purchase" }, { status: 400 });
    }

    if (product.deliveryType === "code_list" && product.stock <= 0) {
      return NextResponse.json({ error: "Product is out of stock" }, { status: 400 });
    }

    const now = Timestamp.now();
    const orderNumber = generateOrderNumber();
    const estimatedProfit = product.price - product.cost;

    const orderRef = db.collection("orders").doc();
    const order: Omit<OrderDoc, "id"> = {
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      totalAmount: product.price,
      paymentFee: 0,
      productCost: product.cost,
      estimatedProfit,
      paymentMethod: "pix",
      paymentStatus: "pending",
      deliveryStatus: "pending",
      gatewayReference: "",
      createdAt: now,
      paidAt: null,
      deliveredAt: null,
      updatedAt: now,
    };

    await orderRef.set(order);

    // Create order item
    await orderRef.collection("items").add({
      productId: product.id,
      productNameSnapshot: product.name,
      quantity: 1,
      unitPrice: product.price,
      unitCost: product.cost,
      totalPrice: product.price,
      totalCost: product.cost,
      createdAt: now,
    });

    // Create payment
    const fullOrder = { id: orderRef.id, ...order } as OrderDoc;
    const payment = await mockPaymentProvider.createPixPayment(fullOrder);

    // Store gateway reference
    await orderRef.update({ gatewayReference: payment.reference, updatedAt: now });

    // Log payment event
    await db.collection("paymentEvents").add({
      orderId: orderRef.id,
      gateway: "mock",
      eventType: "payment_created",
      payload: payment,
      processed: true,
      createdAt: now,
    });

    await emailProvider.sendOrderConfirmation(fullOrder);

    return NextResponse.json({
      orderId: orderRef.id,
      orderNumber,
      pixCode: payment.pixCode,
      pixQrCode: payment.pixQrCode,
      amount: payment.amount,
      expiresAt: payment.expiresAt,
    });
  } catch (err) {
    console.error("[Checkout]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
