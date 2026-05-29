import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifySessionToken } from "@/lib/services/auth";
import { generateSlug } from "@/lib/utils/slug";

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
  const db = getAdminDb();
  const snap = await db.collection("products").doc(id).get();

  if (!snap.exists) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const original = snap.data()!;
  const now = Timestamp.now();
  const newSlug = generateSlug(`${original.name} copia ${Date.now()}`);

  const newRef = db.collection("products").doc();
  await newRef.set({
    ...original,
    name: `${original.name} (Cópia)`,
    slug: newSlug,
    status: "draft",
    stock: 0,
    createdAt: now,
    updatedAt: now,
  });

  // Copy FAQs
  const faqsSnap = await db.collection("products").doc(id).collection("faqs").get();
  const batch = db.batch();
  faqsSnap.docs.forEach((faqDoc) => {
    const newFaqRef = newRef.collection("faqs").doc();
    batch.set(newFaqRef, { ...faqDoc.data(), createdAt: now, updatedAt: now });
  });
  await batch.commit();

  return NextResponse.json({ id: newRef.id });
}
