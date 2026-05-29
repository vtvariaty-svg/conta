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
  const snap = await db
    .collection("products")
    .doc(id)
    .collection("digitalStock")
    .orderBy("createdAt", "desc")
    .get();

  return NextResponse.json({
    codes: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifySessionToken(token);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { codes } = await req.json();

  if (!Array.isArray(codes) || codes.length === 0) {
    return NextResponse.json({ error: "Codes array is required" }, { status: 400 });
  }

  const db = getAdminDb();
  const now = Timestamp.now();
  const stockRef = db.collection("products").doc(id).collection("digitalStock");
  const batch = db.batch();
  const validCodes = (codes as string[]).filter((c) => c.trim());

  for (const code of validCodes) {
    const ref = stockRef.doc();
    batch.set(ref, {
      code: code.trim(),
      status: "available",
      orderId: null,
      deliveredAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  await batch.commit();

  // Update product stock count
  const availableSnap = await stockRef.where("status", "==", "available").get();
  await db
    .collection("products")
    .doc(id)
    .update({ stock: availableSnap.size, updatedAt: now });

  return NextResponse.json({ added: validCodes.length });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifySessionToken(token);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { codeId, status } = await req.json();

  if (!codeId || !status) {
    return NextResponse.json({ error: "codeId and status required" }, { status: 400 });
  }

  const db = getAdminDb();
  const codeRef = db.collection("products").doc(id).collection("digitalStock").doc(codeId);
  const codeSnap = await codeRef.get();

  if (!codeSnap.exists) {
    return NextResponse.json({ error: "Code not found" }, { status: 404 });
  }

  // Prevent editing delivered codes destructively
  if (codeSnap.data()!.status === "delivered" && status !== "blocked") {
    return NextResponse.json({ error: "Cannot change status of a delivered code" }, { status: 400 });
  }

  await codeRef.update({ status, updatedAt: Timestamp.now() });

  return NextResponse.json({ success: true });
}
