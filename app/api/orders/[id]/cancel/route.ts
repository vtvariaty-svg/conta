import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifySessionToken } from "@/lib/services/auth";

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
  const snap = await db.collection("orders").doc(id).get();

  if (!snap.exists) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const order = snap.data()!;
  if (order.paymentStatus === "paid") {
    return NextResponse.json({ error: "Cannot cancel a paid order" }, { status: 400 });
  }

  await db.collection("orders").doc(id).update({
    paymentStatus: "canceled",
    updatedAt: Timestamp.now(),
  });

  return NextResponse.json({ success: true });
}
