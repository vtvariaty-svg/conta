export const dynamic = "force-dynamic";

import { getAdminDb } from "@/lib/firebase/admin";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { ProductCard } from "@/components/store/ProductCard";
import type { ProductDoc, CategoryDoc } from "@/lib/types";

async function getData() {
  try {
    const db = getAdminDb();
    const [productsSnap, categoriesSnap] = await Promise.all([
      db.collection("products").where("status", "==", "active").get(),
      db.collection("categories").where("status", "==", "active").get(),
    ]);
    return {
      products: productsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ProductDoc)),
      categories: categoriesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as CategoryDoc)),
    };
  } catch {
    return { products: [], categories: [] };
  }
}

export default async function ProductsPage() {
  const { products, categories } = await getData();

  return (
    <>
      <StoreHeader />
      <main className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white">Todos os Produtos</h1>
            <p className="text-gray-500 mt-2">{products.length} produtos disponíveis</p>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="px-4 py-1.5 rounded-full text-sm bg-purple-600/20 border border-purple-500/30 text-purple-300">
                Todos
              </span>
              {categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="px-4 py-1.5 rounded-full text-sm text-gray-400 border border-gray-700 hover:border-gray-500 hover:text-white transition-colors"
                >
                  {cat.name}
                </a>
              ))}
            </div>
          )}

          {products.length === 0 ? (
            <div className="text-center py-24 text-gray-500">Nenhum produto disponível no momento.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </main>
      <StoreFooter />
    </>
  );
}
