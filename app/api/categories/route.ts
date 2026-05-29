import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifySessionToken } from "@/lib/services/auth";

export async function GET() {
  const db = getAdminDb();
  const snap = await db.collection("categories").orderBy("name").get();
  return NextResponse.json({ categories: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
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
  const now = Timestamp.now();
  const ref = db.collection("categories").doc();
  await ref.set({ ...body, createdAt: now, updatedAt: now });
  return NextResponse.json({ id: ref.id });
}
