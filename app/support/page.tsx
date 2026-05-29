export const dynamic = "force-dynamic";

import { getAdminDb } from "@/lib/firebase/admin";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { Button } from "@/components/ui/Button";
import { MessageCircle, Mail } from "lucide-react";

async function getSettings() {
  try {
    const db = getAdminDb();
    const snap = await db.collection("settings").doc("main").get();
    return snap.data() ?? {};
  } catch {
    return {};
  }
}

export default async function SupportPage() {
  const settings: any = await getSettings();

  return (
    <>
      <StoreHeader />
      <main className="min-h-screen py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Suporte</h1>
          <p className="text-gray-500 mb-10">
            Precisa de ajuda? Entre em contato através dos canais abaixo.
          </p>

          <div className="space-y-4">
            {settings.supportWhatsapp && (
              <a
                href={`https://wa.me/${settings.supportWhatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-gray-900/80 border border-gray-800 hover:border-emerald-700/50 rounded-2xl p-5 transition-all group"
              >
                <div className="h-12 w-12 rounded-xl bg-emerald-900/40 flex items-center justify-center shrink-0">
                  <MessageCircle className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors">WhatsApp</p>
                  <p className="text-sm text-gray-500">{settings.supportWhatsapp}</p>
                </div>
              </a>
            )}

            {settings.supportEmail && (
              <a
                href={`mailto:${settings.supportEmail}`}
                className="flex items-center gap-4 bg-gray-900/80 border border-gray-800 hover:border-blue-700/50 rounded-2xl p-5 transition-all group"
              >
                <div className="h-12 w-12 rounded-xl bg-blue-900/40 flex items-center justify-center shrink-0">
                  <Mail className="h-6 w-6 text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">Email</p>
                  <p className="text-sm text-gray-500">{settings.supportEmail}</p>
                </div>
              </a>
            )}

            {!settings.supportWhatsapp && !settings.supportEmail && (
              <p className="text-gray-500">Informações de contato não configuradas ainda.</p>
            )}
          </div>
        </div>
      </main>
      <StoreFooter />
    </>
  );
}
