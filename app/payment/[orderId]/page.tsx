"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFooter } from "@/components/store/StoreFooter";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils/format";
import { Copy, CheckCircle, Clock, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function PaymentPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const router = useRouter();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Retrieve pix info from sessionStorage (set by checkout)
  const [pixInfo, setPixInfo] = useState<{ pixCode: string; pixQrCode: string; amount: number } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`pix_${orderId}`);
    if (stored) setPixInfo(JSON.parse(stored));
  }, [orderId]);

  async function fetchOrder() {
    const res = await fetch(`/api/orders/${orderId}/status`);
    if (res.ok) {
      const data = await res.json();
      setOrderData(data);
      if (data.paymentStatus === "paid") {
        router.push(`/order/${orderId}`);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchOrder();
    pollRef.current = setInterval(fetchOrder, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [orderId]);

  async function handleMockApprove() {
    setApproving(true);
    const res = await fetch("/api/payments/mock/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    if (res.ok) {
      toast.success("Pagamento aprovado!");
      router.push(`/order/${orderId}`);
    } else {
      toast.error("Erro ao aprovar pagamento");
      setApproving(false);
    }
  }

  function copyPixCode() {
    if (pixInfo?.pixCode) {
      navigator.clipboard.writeText(pixInfo.pixCode);
      toast.success("Código Pix copiado!");
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full" /></div>;

  return (
    <>
      <StoreHeader />
      <main className="min-h-screen py-12 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-6">
            <Clock className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Aguardando Pagamento</h1>
          <p className="text-gray-500 mb-8">
            Escaneie o QR Code ou copie o código Pix para pagar {pixInfo ? formatCurrency(pixInfo.amount) : ""}
          </p>

          {/* QR Code */}
          {pixInfo?.pixQrCode && (
            <div className="bg-white rounded-2xl p-4 inline-block mb-6">
              <Image src={pixInfo.pixQrCode} alt="QR Code Pix" width={200} height={200} />
            </div>
          )}

          {/* Pix Code */}
          {pixInfo?.pixCode && (
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 mb-6 text-left">
              <p className="text-xs text-gray-500 mb-2">Código Pix Copia e Cola</p>
              <div className="flex items-center gap-3">
                <code className="text-xs text-gray-300 flex-1 break-all">{pixInfo.pixCode.slice(0, 60)}...</code>
                <button onClick={copyPixCode} className="shrink-0 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                  <Copy className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              <Button onClick={copyPixCode} variant="outline" size="sm" className="w-full mt-3">
                <Copy className="h-3.5 w-3.5" />
                Copiar código completo
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2 justify-center text-sm text-gray-500 mb-8">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Verificando pagamento automaticamente...
          </div>

          {/* DEV: Mock approve button */}
          <div className="bg-orange-900/20 border border-orange-800/40 rounded-2xl p-5">
            <p className="text-xs text-orange-400 mb-3 font-medium">Ambiente de Desenvolvimento</p>
            <Button onClick={handleMockApprove} loading={approving} variant="secondary" className="w-full">
              <CheckCircle className="h-4 w-4" />
              Simular Pagamento Aprovado
            </Button>
          </div>
        </div>
      </main>
      <StoreFooter />
    </>
  );
}
