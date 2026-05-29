export const dynamic = "force-dynamic";

import { getAdminDb } from "@/lib/firebase/admin";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";

async function getPolicy(): Promise<string> {
  try {
    const db = getAdminDb();
    const snap = await db.collection("settings").doc("main").get();
    return snap.data()?.refundPolicy ?? "";
  } catch {
    return "";
  }
}

export default async function RefundPolicyPage() {
  const policy = await getPolicy();

  return (
    <>
      <StoreHeader />
      <main className="min-h-screen py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Política de Reembolso</h1>
          {policy ? (
            <div className="prose prose-invert max-w-none text-gray-400 whitespace-pre-wrap text-sm leading-7">{policy}</div>
          ) : (
            <p className="text-gray-500">A política de reembolso será publicada em breve.</p>
          )}
        </div>
      </main>
      <StoreFooter />
    </>
  );
}
