"use client";

import { use, useEffect, useState } from "react";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils/format";
import { CheckCircle, Copy, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function OrderSuccessPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${orderId}/status`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data);
        if (data.delivery) setDelivery(data.delivery);
        setLoading(false);
      });
  }, [orderId]);

  function copyDelivery() {
    if (delivery?.deliveryContent) {
      navigator.clipboard.writeText(delivery.deliveryContent);
      toast.success("Conteúdo copiado!");
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" /></div>;

  const isDelivered = order?.deliveryStatus === "delivered";

  return (
    <>
      <StoreHeader />
      <main className="min-h-screen py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-900/40">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {isDelivered ? "Pedido Confirmado!" : "Pagamento Recebido!"}
            </h1>
            <p className="text-gray-500 text-sm">
              {isDelivered
                ? "Seu produto foi entregue. Confira abaixo."
                : "Estamos processando sua entrega. Em breve você receberá o produto."}
            </p>
          </div>

          {/* Order Info */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 mb-6">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Número do pedido</p>
              <p className="font-mono text-purple-400 font-medium">{order?.orderNumber}</p>
            </div>
            {order?.totalAmount && (
              <div className="text-center mt-3">
                <p className="text-xs text-gray-500">Valor pago</p>
                <p className="text-xl font-bold text-white">{formatCurrency(order.totalAmount)}</p>
              </div>
            )}
          </div>

          {/* Delivery Content */}
          {isDelivered && delivery?.deliveryContent && (
            <div className="bg-emerald-900/10 border border-emerald-800/40 rounded-2xl p-6 mb-6">
              <p className="text-sm font-semibold text-emerald-400 mb-3">Seu Produto</p>
              <div className="bg-gray-900 rounded-xl p-4 flex items-start justify-between gap-3">
                <code className="text-sm text-white break-all whitespace-pre-wrap flex-1">
                  {delivery.deliveryContent}
                </code>
                <button
                  onClick={copyDelivery}
                  className="shrink-0 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <Copy className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              <Button onClick={copyDelivery} variant="outline" size="sm" className="w-full mt-3">
                <Copy className="h-3.5 w-3.5" />
                Copiar conteúdo
              </Button>
            </div>
          )}

          {order?.deliveryStatus === "manual_required" && (
            <div className="bg-orange-900/10 border border-orange-800/40 rounded-2xl p-6 mb-6">
              <p className="text-sm font-semibold text-orange-400 mb-2">Entrega em Andamento</p>
              <p className="text-sm text-gray-400">
                Seu pagamento foi confirmado! Nossa equipe está processando a entrega manualmente e você receberá seu produto em breve.
              </p>
            </div>
          )}

          {/* Support */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">Algum problema? Entre em contato com o suporte.</p>
            <Link href="/support">
              <Button variant="ghost" size="sm">
                <MessageCircle className="h-4 w-4" />
                Falar com Suporte
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <StoreFooter />
    </>
  );
}
