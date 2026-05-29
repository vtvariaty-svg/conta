import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb, getAdminAuth } from "@/lib/firebase/admin";
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
  const { note } = await req.json();

  if (!note?.trim()) {
    return NextResponse.json({ error: "Note cannot be empty" }, { status: 400 });
  }

  const db = getAdminDb();
  const auth = getAdminAuth();
  const userRecord = await auth.getUser(session.uid);
  const userSnap = await db.collection("users").doc(session.uid).get();
  const userName = userSnap.data()?.name ?? userRecord.email ?? "Unknown";

  await db.collection("orders").doc(id).collection("notes").add({
    userId: session.uid,
    userName,
    note: note.trim(),
    createdAt: Timestamp.now(),
  });

  return NextResponse.json({ success: true });
}
