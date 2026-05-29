"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { PaymentStatusBadge, DeliveryStatusBadge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  MessageSquare,
  Copy,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getToken, role } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [resolveContent, setResolveContent] = useState("");
  const [showResolve, setShowResolve] = useState(false);

  async function fetchOrder() {
    const token = await getToken();
    const res = await fetch(`/api/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setData(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchOrder(); }, [id]);

  async function handleResend() {
    const token = await getToken();
    const res = await fetch(`/api/orders/${id}/deliver`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) { toast.success("Entrega reenviada!"); fetchOrder(); }
    else toast.error("Erro ao reenviar entrega");
  }

  async function handleResolve() {
    const token = await getToken();
    const res = await fetch(`/api/orders/${id}/resolve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ deliveryContent: resolveContent }),
    });
    if (res.ok) { toast.success("Entrega resolvida!"); setShowResolve(false); fetchOrder(); }
    else toast.error("Erro ao resolver");
  }

  async function handleAddNote() {
    if (!note.trim()) return;
    const token = await getToken();
    const res = await fetch(`/api/orders/${id}/notes`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    if (res.ok) { toast.success("Nota adicionada"); setNote(""); fetchOrder(); }
  }

  async function handleCancel() {
    if (!confirm("Cancelar este pedido?")) return;
    const token = await getToken();
    await fetch(`/api/orders/${id}/cancel`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("Pedido cancelado");
    fetchOrder();
  }

  async function handleMockApprove() {
    const token = await getToken();
    const res = await fetch("/api/payments/mock/approve", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: id }),
    });
    if (res.ok) { toast.success("Pagamento aprovado! Entrega processada."); fetchOrder(); }
    else toast.error("Erro ao aprovar pagamento");
  }

  if (loading) return <PageLoader />;
  if (!data) return <div className="p-8 text-gray-400">Pedido não encontrado</div>;

  const { order, items, deliveries, notes } = data;

  const deliveredDelivery = deliveries.find((d: any) => d.status === "delivered" || d.status === "resent");

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/orders">
          <button className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-gray-800 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Pedido {order.orderNumber}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {order.createdAt?.toDate ? formatDate(order.createdAt.toDate()) : "-"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        {order.paymentStatus === "pending" && (
          <Button size="sm" onClick={handleMockApprove}>
            <Zap className="h-3.5 w-3.5" /> Aprovar Pagamento (Mock)
          </Button>
        )}
        {order.paymentStatus === "paid" && order.deliveryStatus !== "manual_required" && (
          <Button variant="secondary" size="sm" onClick={handleResend}>
            <RefreshCw className="h-3.5 w-3.5" /> Reenviar Entrega
          </Button>
        )}
        {order.deliveryStatus === "manual_required" && (
          <Button variant="secondary" size="sm" onClick={() => setShowResolve(!showResolve)}>
            <CheckCircle className="h-3.5 w-3.5" /> Resolver Entrega Manual
          </Button>
        )}
        {order.paymentStatus === "pending" && (
          <Button variant="danger" size="sm" onClick={handleCancel}>
            <XCircle className="h-3.5 w-3.5" /> Cancelar Pedido
          </Button>
        )}
      </div>

      {showResolve && (
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 mb-6">
          <label className="text-sm font-medium text-gray-300 block mb-2">Conteúdo da entrega manual</label>
          <textarea
            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
            rows={3}
            placeholder="Cole aqui o código, link ou instruções..."
            value={resolveContent}
            onChange={(e) => setResolveContent(e.target.value)}
          />
          <div className="flex gap-3 mt-3">
            <Button size="sm" onClick={handleResolve}>Salvar e Resolver</Button>
            <Button variant="secondary" size="sm" onClick={() => setShowResolve(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Cliente</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Nome</dt><dd className="text-white">{order.customerName}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Email</dt><dd className="text-white">{order.customerEmail}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">WhatsApp</dt><dd className="text-white">{order.customerPhone}</dd></div>
            </dl>
          </div>

          {/* Items */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Itens do Pedido</h2>
            {items.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm py-2 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-white">{item.productNameSnapshot}</p>
                  <p className="text-gray-500 text-xs">Qtd: {item.quantity} · Custo: {formatCurrency(item.totalCost)}</p>
                </div>
                <span className="font-semibold text-white">{formatCurrency(item.totalPrice)}</span>
              </div>
            ))}
          </div>

          {/* Deliveries */}
          {deliveries.length > 0 && (
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-white mb-4">Entregas</h2>
              {deliveries.map((d: any) => (
                <div key={d.id} className="py-3 border-b border-gray-800 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <DeliveryStatusBadge status={d.status} />
                    <span className="text-xs text-gray-500">
                      {d.deliveredAt?.toDate ? formatDate(d.deliveredAt.toDate()) : "-"}
                    </span>
                  </div>
                  {d.deliveryContent && (
                    <div className="mt-2 bg-gray-800 rounded-lg p-3 flex items-center justify-between gap-2">
                      <code className="text-xs text-emerald-400 break-all">{d.deliveryContent}</code>
                      <button
                        onClick={() => { navigator.clipboard.writeText(d.deliveryContent); toast.success("Copiado!"); }}
                        className="shrink-0 text-gray-500 hover:text-white"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Observações Internas</h2>
            {notes.length === 0 && <p className="text-sm text-gray-500">Nenhuma observação ainda.</p>}
            {notes.map((n: any) => (
              <div key={n.id} className="py-3 border-b border-gray-800 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-purple-400">{n.userName}</span>
                  <span className="text-xs text-gray-500">{n.createdAt?.toDate ? formatDate(n.createdAt.toDate()) : ""}</span>
                </div>
                <p className="text-sm text-gray-300">{n.note}</p>
              </div>
            ))}
            <div className="mt-4 flex gap-3">
              <input
                className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="Adicionar observação..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
              />
              <Button size="sm" onClick={handleAddNote}>
                <MessageSquare className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Status</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Pagamento</span>
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Entrega</span>
                <DeliveryStatusBadge status={order.deliveryStatus} />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Financeiro</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Valor total</span>
                <span className="text-white font-semibold">{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Custo</span>
                <span className="text-gray-400">{formatCurrency(order.productCost)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-800 pt-2 mt-2">
                <span className="text-gray-500">Lucro est.</span>
                <span className="text-emerald-400 font-semibold">{formatCurrency(order.estimatedProfit)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
