"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ProductForm } from "../../_components/ProductForm";
import { PageLoader } from "@/components/ui/Spinner";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getToken } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const res = await fetch(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProduct({ ...data.product, faqs: data.faqs });
      }
      setLoading(false);
    })();
  }, [id, getToken]);

  if (loading) return <PageLoader />;
  if (!product) return <div className="p-8 text-gray-400">Produto não encontrado</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Editar Produto</h1>
        <p className="text-sm text-gray-500 mt-1">{product.name}</p>
      </div>
      <ProductForm product={product} onSuccess={() => router.push("/admin/products")} />
    </div>
  );
}
