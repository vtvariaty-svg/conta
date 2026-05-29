"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { PaymentStatusBadge, DeliveryStatusBadge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Eye, Search } from "lucide-react";
import type { OrderDoc } from "@/lib/types";

export default function AdminOrders() {
  const { getToken } = useAuth();
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [filterDelivery, setFilterDelivery] = useState("");

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const res = await fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setOrders((await res.json()).orders);
      setLoading(false);
    })();
  }, [getToken]);

  const filtered = orders.filter((o) => {
    if (search) {
      const q = search.toLowerCase();
      if (!o.customerName.toLowerCase().includes(q) && !o.customerEmail.toLowerCase().includes(q) && !o.orderNumber.toLowerCase().includes(q)) return false;
    }
    if (filterPayment && o.paymentStatus !== filterPayment) return false;
    if (filterDelivery && o.deliveryStatus !== filterDelivery) return false;
    return true;
  });

  if (loading) return <PageLoader />;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Pedidos</h1>
        <p className="text-sm text-gray-500 mt-1">{orders.length} pedidos</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            placeholder="Buscar por cliente, email, nº pedido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
        >
          <option value="">Todos os pagamentos</option>
          <option value="pending">Pendente</option>
          <option value="paid">Pago</option>
          <option value="canceled">Cancelado</option>
          <option value="expired">Expirado</option>
        </select>
        <select
          className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
          value={filterDelivery}
          onChange={(e) => setFilterDelivery(e.target.value)}
        >
          <option value="">Todas as entregas</option>
          <option value="pending">Pendente</option>
          <option value="delivered">Entregue</option>
          <option value="manual_required">Manual</option>
          <option value="failed">Falhou</option>
        </select>
      </div>

      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Pedido</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Pagamento</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Entrega</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-gray-500">Nenhum pedido encontrado</td></tr>
              )}
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-purple-400">{order.orderNumber}</span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-white font-medium">{order.customerName}</p>
                    <p className="text-xs text-gray-500">{order.customerEmail}</p>
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-white">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-4 py-4"><PaymentStatusBadge status={order.paymentStatus} /></td>
                  <td className="px-4 py-4"><DeliveryStatusBadge status={order.deliveryStatus} /></td>
                  <td className="px-4 py-4 text-gray-500 text-xs">
                    {order.createdAt
                      ? formatDate((order.createdAt as any).toDate?.() ?? order.createdAt)
                      : "-"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end">
                      <Link href={`/admin/orders/${order.id}`}>
                        <button className="p-1.5 rounded-lg text-gray-500 hover:text-purple-400 hover:bg-purple-900/20 transition-colors">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
