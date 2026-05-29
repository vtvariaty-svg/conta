export const dynamic = "force-dynamic";

import { getAdminDb } from "@/lib/firebase/admin";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";

async function getTerms(): Promise<string> {
  try {
    const db = getAdminDb();
    const snap = await db.collection("settings").doc("main").get();
    return snap.data()?.terms ?? "";
  } catch {
    return "";
  }
}

export default async function TermsPage() {
  const terms = await getTerms();

  return (
    <>
      <StoreHeader />
      <main className="min-h-screen py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Termos de Uso</h1>
          {terms ? (
            <div className="prose prose-invert max-w-none text-gray-400 whitespace-pre-wrap text-sm leading-7">{terms}</div>
          ) : (
            <p className="text-gray-500">Os termos de uso serão publicados em breve.</p>
          )}
        </div>
      </main>
      <StoreFooter />
    </>
  );
}
