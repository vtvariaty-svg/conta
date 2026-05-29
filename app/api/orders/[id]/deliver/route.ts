import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifySessionToken } from "@/lib/services/auth";
import { processDelivery } from "@/lib/services/delivery";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifySessionToken(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getAdminDb();
  const orderSnap = await db.collection("orders").doc(id).get();

  if (!orderSnap.exists) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const order = orderSnap.data()!;
  if (order.paymentStatus !== "paid") {
    return NextResponse.json({ error: "Order not paid" }, { status: 400 });
  }

  // Mark existing deliveries as resent
  const deliveriesSnap = await db.collection("orders").doc(id).collection("deliveries").get();
  const batch = db.batch();
  deliveriesSnap.docs.forEach((d) => {
    batch.update(d.ref, { status: "resent", resentAt: Timestamp.now() });
  });
  await batch.commit();

  // Reset delivery status so processDelivery can re-run
  await db.collection("orders").doc(id).update({
    deliveryStatus: "pending",
    updatedAt: Timestamp.now(),
  });

  await processDelivery(id);

  return NextResponse.json({ success: true });
}
