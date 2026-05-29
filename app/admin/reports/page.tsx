"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { KPICard } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { DollarSign, TrendingUp, ShoppingCart, AlertTriangle, Package, BarChart3 } from "lucide-react";
import type { ReportData } from "@/lib/types";

export default function AdminReports() {
  const { getToken } = useAuth();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const res = await fetch("/api/reports", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setData(await res.json());
      setLoading(false);
    })();
  }, [getToken]);

  if (loading) return <PageLoader />;
  if (!data) return <div className="p-8 text-gray-400">Erro ao carregar relatórios</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Relatórios</h1>
        <p className="text-sm text-gray-500 mt-1">Visão financeira e operacional</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KPICard title="Faturamento Bruto" value={formatCurrency(data.grossRevenue)} icon={<DollarSign className="h-5 w-5" />} gradient="bg-gradient-to-br from-purple-900/40 to-purple-900/10 border-purple-800/30" />
        <KPICard title="Custo Total" value={formatCurrency(data.totalCost)} icon={<TrendingUp className="h-5 w-5" />} gradient="bg-gradient-to-br from-red-900/30 to-red-900/10 border-red-800/20" />
        <KPICard title="Lucro Estimado" value={formatCurrency(data.estimatedProfit)} subtitle={`Margem: ${formatPercent(data.estimatedMargin)}`} icon={<BarChart3 className="h-5 w-5" />} gradient="bg-gradient-to-br from-emerald-900/40 to-emerald-900/10 border-emerald-800/30" />
        <KPICard title="Pedidos Pagos" value={String(data.paidOrders)} subtitle={`${data.pendingOrders} pendentes · ${data.canceledOrders} cancelados`} icon={<ShoppingCart className="h-5 w-5" />} gradient="bg-gradient-to-br from-blue-900/40 to-blue-900/10 border-blue-800/30" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top by Revenue */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-purple-400" />
            Top Produtos por Faturamento
          </h2>
          {data.topProductsByRevenue.length === 0 && <p className="text-sm text-gray-500">Nenhum dado disponível</p>}
          {data.topProductsByRevenue.map((p, i) => (
            <div key={p.productId} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-gray-600 w-4">{i + 1}.</span>
                <div>
                  <p className="text-gray-300 truncate max-w-48">{p.productName}</p>
                  <p className="text-gray-500 text-xs">{p.soldCount} vendas</p>
                </div>
              </div>
              <span className="font-semibold text-white">{formatCurrency(p.revenue)}</span>
            </div>
          ))}
        </div>

        {/* Top by Profit */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            Top Produtos por Lucro
          </h2>
          {data.topProductsByProfit.length === 0 && <p className="text-sm text-gray-500">Nenhum dado disponível</p>}
          {data.topProductsByProfit.map((p, i) => (
            <div key={p.productId} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-gray-600 w-4">{i + 1}.</span>
                <p className="text-gray-300 truncate max-w-48">{p.productName}</p>
              </div>
              <span className="font-semibold text-emerald-400">{formatCurrency(p.profit)}</span>
            </div>
          ))}
        </div>

        {/* Alerts */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            Alertas Operacionais
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Entregas manuais pendentes</span>
              <span className={`font-semibold ${data.manualDeliveryPending > 0 ? "text-orange-400" : "text-gray-500"}`}>
                {data.manualDeliveryPending}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Produtos pausados</span>
              <span className="text-yellow-400 font-semibold">{data.pausedProducts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Produtos com estoque baixo (≤3)</span>
              <span className={`font-semibold ${data.lowStockProducts.length > 0 ? "text-orange-400" : "text-gray-500"}`}>
                {data.lowStockProducts.length}
              </span>
            </div>
          </div>
        </div>

        {/* Low stock */}
        {data.lowStockProducts.length > 0 && (
          <div className="bg-orange-900/10 border border-orange-800/30 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-orange-400 mb-4 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Estoque Baixo
            </h2>
            {data.lowStockProducts.map((p: any) => (
              <div key={p.id} className="flex justify-between py-2 border-b border-orange-900/20 last:border-0 text-sm">
                <span className="text-gray-300">{p.name}</span>
                <span className="text-orange-400 font-semibold">{p.stock} restantes</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
