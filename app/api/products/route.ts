import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifySessionToken } from "@/lib/services/auth";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const publicOnly = url.searchParams.get("public") === "1";

  const db = getAdminDb();
  let query = db.collection("products").orderBy("createdAt", "desc") as FirebaseFirestore.Query;

  if (publicOnly) {
    query = query.where("status", "==", "active");
  }

  const snap = await query.get();
  const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifySessionToken(token);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const db = getAdminDb();

  // Check slug uniqueness
  const slugCheck = await db.collection("products").where("slug", "==", body.slug).get();
  if (!slugCheck.empty) {
    return NextResponse.json({ error: "Slug already in use" }, { status: 400 });
  }

  const now = Timestamp.now();
  const ref = db.collection("products").doc();
  await ref.set({ ...body, createdAt: now, updatedAt: now });

  return NextResponse.json({ id: ref.id });
}
