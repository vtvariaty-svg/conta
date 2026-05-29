export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getAdminDb } from "@/lib/firebase/admin";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { ProductCard } from "@/components/store/ProductCard";
import type { ProductDoc, CategoryDoc } from "@/lib/types";

async function getData(slug: string): Promise<{ category: CategoryDoc; products: ProductDoc[] } | null> {
  try {
    const db = getAdminDb();
    const catSnap = await db.collection("categories").where("slug", "==", slug).limit(1).get();
    if (catSnap.empty) return null;
    const category = { id: catSnap.docs[0].id, ...catSnap.docs[0].data() } as CategoryDoc;
    const productsSnap = await db
      .collection("products")
      .where("categoryId", "==", category.id)
      .where("status", "==", "active")
      .get();
    return {
      category,
      products: productsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ProductDoc)),
    };
  } catch {
    return null;
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getData(slug);

  if (!data) notFound();

  const { category, products } = data;

  return (
    <>
      <StoreHeader />
      <main className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white">{category.name}</h1>
            {category.description && <p className="text-gray-500 mt-2">{category.description}</p>}
            <p className="text-gray-600 text-sm mt-1">{products.length} produtos</p>
          </div>
          {products.length === 0 ? (
            <div className="text-center py-24 text-gray-500">Nenhum produto nesta categoria.</div>
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
