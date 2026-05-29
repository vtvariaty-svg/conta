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
  const { deliveryContent } = await req.json();
  const db = getAdminDb();
  const now = Timestamp.now();

  await db.collection("orders").doc(id).update({
    deliveryStatus: "delivered",
    deliveredAt: now,
    updatedAt: now,
  });

  // Create resolution delivery record
  await db.collection("orders").doc(id).collection("deliveries").add({
    productId: "",
    deliveryType: "manual",
    deliveryContent: deliveryContent ?? "Entrega manual concluída pelo operador",
    status: "delivered",
    sentToEmail: "",
    deliveredAt: now,
    resentAt: null,
    createdAt: now,
  });

  return NextResponse.json({ success: true });
}
