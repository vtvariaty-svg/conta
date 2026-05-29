"use client";

import { useRouter } from "next/navigation";
import { ProductForm } from "../_components/ProductForm";

export default function NewProductPage() {
  const router = useRouter();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Novo Produto</h1>
        <p className="text-sm text-gray-500 mt-1">Preencha as informações do produto</p>
      </div>
      <ProductForm onSuccess={(id) => router.push("/admin/products")} />
    </div>
  );
}
