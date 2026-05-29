"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils/format";
import { ShoppingBag, Shield } from "lucide-react";

interface CheckoutForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export default function CheckoutPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>();

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((data) => { setProduct(data.product); setLoading(false); })
      .catch(() => setLoading(false));
  }, [productId]);

  const onSubmit = async (data: CheckoutForm) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...data }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Erro ao processar pedido");
        return;
      }
      sessionStorage.setItem(`pix_${result.orderId}`, JSON.stringify({
        pixCode: result.pixCode,
        pixQrCode: result.pixQrCode,
        amount: result.amount,
      }));
      router.push(`/payment/${result.orderId}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" /></div>;
  if (!product) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Produto não encontrado</div>;

  return (
    <>
      <StoreHeader />
      <main className="min-h-screen py-12 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-white mb-2">Finalizar Compra</h1>
          <p className="text-gray-500 text-sm mb-8">Preencha seus dados para prosseguir</p>

          {/* Product Summary */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 mb-6 flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
              <ShoppingBag className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{product.name}</p>
              <p className="text-xs text-gray-500">{product.categoryName}</p>
            </div>
            <span className="font-bold text-lg gradient-text shrink-0">{formatCurrency(product.price)}</span>
          </div>

          {/* Form */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Nome completo *"
                placeholder="Seu nome"
                error={errors.customerName?.message}
                {...register("customerName", { required: "Nome obrigatório" })}
              />
              <Input
                label="Email *"
                type="email"
                placeholder="seu@email.com"
                hint="O produto será enviado para este email"
                error={errors.customerEmail?.message}
                {...register("customerEmail", { required: "Email obrigatório" })}
              />
              <Input
                label="WhatsApp *"
                placeholder="+55 11 99999-9999"
                error={errors.customerPhone?.message}
                {...register("customerPhone", { required: "WhatsApp obrigatório" })}
              />

              <div className="pt-2">
                <Button type="submit" loading={submitting} size="lg" className="w-full">
                  Pagar com Pix — {formatCurrency(product.price)}
                </Button>
              </div>
            </form>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-600">
            <Shield className="h-3.5 w-3.5" />
            Compra 100% segura
          </div>
        </div>
      </main>
      <StoreFooter />
    </>
  );
}
