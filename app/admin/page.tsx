"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { KPICard } from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/Spinner";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { BarChart3, DollarSign, ShoppingCart, AlertTriangle, Package } from "lucide-react";
import type { ReportData } from "@/lib/types";

export default function AdminDashboard() {
  const { getToken } = useAuth();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const res = await fetch("/api/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setData(await res.json());
      setLoading(false);
    })();
  }, [getToken]);

  if (loading) return <PageLoader />;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral da operação</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KPICard
          title="Faturamento Bruto"
          value={formatCurrency(data?.grossRevenue ?? 0)}
          subtitle="Pedidos pagos"
          icon={<DollarSign className="h-5 w-5" />}
          gradient="bg-gradient-to-br from-purple-900/40 to-purple-900/10 border-purple-800/30"
        />
        <KPICard
          title="Lucro Estimado"
          value={formatCurrency(data?.estimatedProfit ?? 0)}
          subtitle={`Margem: ${formatPercent(data?.estimatedMargin ?? 0)}`}
          icon={<BarChart3 className="h-5 w-5" />}
          gradient="bg-gradient-to-br from-blue-900/40 to-blue-900/10 border-blue-800/30"
        />
        <KPICard
          title="Pedidos Pagos"
          value={String(data?.paidOrders ?? 0)}
          subtitle={`${data?.pendingOrders ?? 0} pendentes`}
          icon={<ShoppingCart className="h-5 w-5" />}
          gradient="bg-gradient-to-br from-emerald-900/40 to-emerald-900/10 border-emerald-800/30"
        />
        <KPICard
          title="Entregas Manuais"
          value={String(data?.manualDeliveryPending ?? 0)}
          subtitle="Aguardando resolução"
          icon={<AlertTriangle className="h-5 w-5" />}
          gradient={
            (data?.manualDeliveryPending ?? 0) > 0
              ? "bg-gradient-to-br from-orange-900/40 to-orange-900/10 border-orange-800/30"
              : "bg-gray-900/80 border-gray-800"
          }
        />
      </div>

      {/* Top Products */}
      {data && data.topProductsByRevenue.length > 0 && (
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-purple-400" />
            Top Produtos por Faturamento
          </h2>
          <div className="space-y-3">
            {data.topProductsByRevenue.slice(0, 5).map((p, i) => (
              <div key={p.productId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 w-5 text-right">{i + 1}.</span>
                  <span className="text-gray-300 truncate max-w-xs">{p.productName}</span>
                  <span className="text-gray-500 text-xs">{p.soldCount}x</span>
                </div>
                <span className="font-semibold text-white">{formatCurrency(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {(data?.lowStockProducts.length ?? 0) > 0 && (
        <div className="mt-4 bg-orange-900/10 border border-orange-800/30 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Produtos com Estoque Baixo
          </h2>
          <div className="space-y-2">
            {data!.lowStockProducts.map((p: any) => (
              <div key={p.id} className="flex justify-between text-sm">
                <span className="text-gray-300">{p.name}</span>
                <span className="text-orange-400 font-medium">{p.stock} restantes</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
