import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifySessionToken } from "@/lib/services/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getAdminDb();
  const snap = await db.collection("products").doc(id).get();

  if (!snap.exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const faqsSnap = await db
    .collection("products")
    .doc(id)
    .collection("faqs")
    .orderBy("sortOrder")
    .get();

  return NextResponse.json({
    product: { id: snap.id, ...snap.data() },
    faqs: faqsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
  });
}

export async function PUT(
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
  const body = await req.json();
  const db = getAdminDb();

  const { faqs, ...productData } = body;

  await db
    .collection("products")
    .doc(id)
    .update({ ...productData, updatedAt: Timestamp.now() });

  // Sync FAQs if provided
  if (Array.isArray(faqs)) {
    const faqsRef = db.collection("products").doc(id).collection("faqs");
    const existingSnap = await faqsRef.get();
    const batch = db.batch();
    existingSnap.docs.forEach((d) => batch.delete(d.ref));
    faqs.forEach((faq: { question: string; answer: string; sortOrder: number }) => {
      const newRef = faqsRef.doc();
      batch.set(newRef, {
        ...faq,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    });
    await batch.commit();
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
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
  const db = getAdminDb();

  // Check if any orders reference this product
  const ordersSnap = await db
    .collection("orders")
    .where("paymentStatus", "in", ["paid", "pending", "refunded"])
    .get();

  let hasLinkedOrder = false;
  for (const orderDoc of ordersSnap.docs) {
    const itemsSnap = await db
      .collection("orders")
      .doc(orderDoc.id)
      .collection("items")
      .where("productId", "==", id)
      .limit(1)
      .get();
    if (!itemsSnap.empty) {
      hasLinkedOrder = true;
      break;
    }
  }

  if (hasLinkedOrder) {
    // Archive instead of delete
    await db
      .collection("products")
      .doc(id)
      .update({ status: "archived", updatedAt: Timestamp.now() });
    return NextResponse.json({ archived: true });
  }

  await db.collection("products").doc(id).delete();
  return NextResponse.json({ deleted: true });
}
