import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import type { UserRole } from "@/lib/types";

export async function verifySessionToken(
  token: string
): Promise<{ uid: string; role: UserRole } | null> {
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    const userSnap = await getAdminDb()
      .collection("users")
      .doc(decoded.uid)
      .get();

    if (!userSnap.exists) return null;

    const data = userSnap.data()!;
    if (data.status !== "active") return null;

    return { uid: decoded.uid, role: data.role as UserRole };
  } catch {
    return null;
  }
}
