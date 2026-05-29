import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifySessionToken } from "@/lib/services/auth";

const SETTINGS_DOC = "main";

export async function GET() {
  const db = getAdminDb();
  const snap = await db.collection("settings").doc(SETTINGS_DOC).get();
  return NextResponse.json(snap.exists ? snap.data() : {});
}

export async function PUT(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await verifySessionToken(token);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const db = getAdminDb();
  const now = Timestamp.now();

  await db.collection("settings").doc(SETTINGS_DOC).set(
    { ...body, updatedAt: now },
    { merge: true }
  );

  return NextResponse.json({ success: true });
}
