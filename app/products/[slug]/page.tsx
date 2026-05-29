export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAdminDb } from "@/lib/firebase/admin";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils/format";
import { ShoppingBag, Shield, Zap, ChevronDown } from "lucide-react";
import type { ProductDoc, FaqDoc } from "@/lib/types";

async function getProduct(slug: string): Promise<{ product: ProductDoc; faqs: FaqDoc[] } | null> {
  try {
    const db = getAdminDb();
    const snap = await db.collection("products").where("slug", "==", slug).where("status", "==", "active").limit(1).get();
    if (snap.empty) return null;
    const productDoc = snap.docs[0];
    const faqsSnap = await productDoc.ref.collection("faqs").orderBy("sortOrder").get();
    return {
      product: { id: productDoc.id, ...productDoc.data() } as ProductDoc,
      faqs: faqsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as FaqDoc)),
    };
  } catch {
    return null;
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProduct(slug);

  if (!data) notFound();

  const { product, faqs } = data;

  return (
    <>
      <StoreHeader />
      <main className="min-h-screen py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
            {/* Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-900 border border-gray-800">
              {product.imageUrl ? (
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShoppingBag className="h-20 w-20 text-gray-700" />
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <p className="text-sm text-purple-400 mb-2">{product.categoryName}</p>
              <h1 className="text-3xl font-bold text-white mb-4">{product.name}</h1>
              <p className="text-gray-400 mb-6">{product.shortDescription}</p>

              <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 mb-6">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold gradient-text">{formatCurrency(product.price)}</span>
                  <span className="text-gray-500 text-sm">via Pix</span>
                </div>

                <div className="space-y-2 text-sm text-gray-400 mb-6">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-400" />
                    Entrega automática após confirmação do pagamento
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-400" />
                    Compra 100% segura
                  </div>
                </div>

                <Link href={`/checkout/${product.id}`}>
                  <Button size="lg" className="w-full">
                    <ShoppingBag className="h-5 w-5" />
                    Comprar Agora
                  </Button>
                </Link>
              </div>

              {product.replacementPolicy && (
                <p className="text-xs text-gray-500 text-center">{product.replacementPolicy}</p>
              )}
            </div>
          </div>

          {/* Full Description */}
          {product.fullDescription && (
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Descrição</h2>
              <div className="text-gray-400 whitespace-pre-wrap text-sm leading-7">{product.fullDescription}</div>
            </div>
          )}

          {/* Instructions */}
          {product.instructions && (
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Instruções de Uso</h2>
              <div className="text-gray-400 whitespace-pre-wrap text-sm leading-7">{product.instructions}</div>
            </div>
          )}

          {/* FAQs */}
          {faqs.length > 0 && (
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-white mb-6">Perguntas Frequentes</h2>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <details key={faq.id} className="group border border-gray-800 rounded-xl">
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                      <span className="font-medium text-white text-sm">{faq.question}</span>
                      <ChevronDown className="h-4 w-4 text-gray-500 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="px-5 pb-4 text-sm text-gray-400">{faq.answer}</div>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <StoreFooter />
    </>
  );
}
