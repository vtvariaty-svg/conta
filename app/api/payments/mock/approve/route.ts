import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { processDelivery } from "@/lib/services/delivery";
import type { OrderDoc } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const db = getAdminDb();
    const orderRef = db.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = { id: orderSnap.id, ...orderSnap.data() } as OrderDoc;

    // Idempotency: already processed
    if (order.paymentStatus === "paid") {
      return NextResponse.json({ message: "Already paid" });
    }

    if (order.paymentStatus !== "pending") {
      return NextResponse.json(
        { error: `Cannot approve payment in status: ${order.paymentStatus}` },
        { status: 400 }
      );
    }

    const now = Timestamp.now();
    await orderRef.update({
      paymentStatus: "paid",
      paidAt: now,
      updatedAt: now,
    });

    // Log payment event
    await db.collection("paymentEvents").add({
      orderId,
      gateway: "mock",
      eventType: "payment_approved",
      payload: { orderId, approvedAt: now.toDate().toISOString() },
      processed: true,
      createdAt: now,
    });

    await processDelivery(orderId);

    return NextResponse.json({ success: true, orderId });
  } catch (err) {
    console.error("[MockApprove]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
