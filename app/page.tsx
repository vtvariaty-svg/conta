export const dynamic = "force-dynamic";

import Link from "next/link";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { ProductCard } from "@/components/store/ProductCard";
import { Button } from "@/components/ui/Button";
import { getAdminDb } from "@/lib/firebase/admin";
import { Zap, Shield, Clock } from "lucide-react";
import type { ProductDoc } from "@/lib/types";

async function getFeaturedProducts(): Promise<ProductDoc[]> {
  try {
    const db = getAdminDb();
    const snap = await db
      .collection("products")
      .where("status", "==", "active")
      .limit(6)
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProductDoc));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <>
      <StoreHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative">
            <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-700/40 rounded-full px-4 py-1.5 text-xs text-purple-300 mb-6">
              <Zap className="h-3 w-3" />
              Entrega automática imediata
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Produtos Digitais{" "}
              <span className="gradient-text">Premium</span>
            </h1>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Acesse os melhores produtos digitais com entrega automática após o pagamento. Seguro, rápido e confiável.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/products">
                <Button size="lg">Ver todos os produtos</Button>
              </Link>
              <Link href="/support">
                <Button size="lg" variant="outline">Falar com suporte</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 px-4 border-t border-gray-800/50">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Entrega Automática", desc: "Receba seu produto imediatamente após a confirmação do pagamento." },
              { icon: Shield, title: "Compra Segura", desc: "Transações seguras com pagamento via Pix." },
              { icon: Clock, title: "Suporte Rápido", desc: "Nossa equipe está pronta para ajudar caso tenha algum problema." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-6 bg-gray-900/50 rounded-2xl border border-gray-800">
                <div className="h-10 w-10 rounded-xl bg-purple-900/40 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{title}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Products */}
        {products.length > 0 && (
          <section className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Produtos em Destaque</h2>
                <Link href="/products" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                  Ver todos →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          </section>
        )}
      </main>
      <StoreFooter />
    </>
  );
}
