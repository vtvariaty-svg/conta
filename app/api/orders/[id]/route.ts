import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifySessionToken } from "@/lib/services/auth";

export async function GET(
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

  const [itemsSnap, deliveriesSnap, notesSnap] = await Promise.all([
    db.collection("orders").doc(id).collection("items").get(),
    db.collection("orders").doc(id).collection("deliveries").orderBy("createdAt", "desc").get(),
    db.collection("orders").doc(id).collection("notes").orderBy("createdAt", "desc").get(),
  ]);

  return NextResponse.json({
    order: { id: orderSnap.id, ...orderSnap.data() },
    items: itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    deliveries: deliveriesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    notes: notesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifySessionToken(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const db = getAdminDb();

  await db.collection("orders").doc(id).update({ ...body, updatedAt: Timestamp.now() });

  return NextResponse.json({ success: true });
}
