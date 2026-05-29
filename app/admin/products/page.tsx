"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { ProductStatusBadge, RiskBadge, Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { formatCurrency, calculateMargin, formatPercent } from "@/lib/utils/format";
import { Plus, Pencil, Trash2, Copy, Pause, Play, Archive, Search } from "lucide-react";
import type { ProductDoc, CategoryDoc } from "@/lib/types";

export default function AdminProducts() {
  const { getToken } = useAuth();
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterRisk, setFilterRisk] = useState("");

  async function fetchProducts() {
    const token = await getToken();
    const [pRes, cRes] = await Promise.all([
      fetch("/api/products", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/categories", { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    if (pRes.ok) setProducts((await pRes.json()).products);
    if (cRes.ok) setCategories((await cRes.json()).categories);
    setLoading(false);
  }

  useEffect(() => { fetchProducts(); }, []);

  async function handleStatusChange(id: string, status: string) {
    const token = await getToken();
    await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    toast.success("Status atualizado");
    fetchProducts();
  }

  async function handleDuplicate(id: string) {
    const token = await getToken();
    const res = await fetch(`/api/products/${id}/duplicate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      toast.success("Produto duplicado");
      fetchProducts();
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir "${name}"? Se houver pedidos vinculados, o produto será arquivado.`)) return;
    const token = await getToken();
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      toast.success(data.archived ? "Produto arquivado (possui pedidos)" : "Produto excluído");
      fetchProducts();
    }
  }

  const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    if (filterCategory && p.categoryId !== filterCategory) return false;
    if (filterRisk && p.riskLevel !== filterRisk) return false;
    return true;
  });

  const deliveryTypeLabel: Record<string, string> = {
    fixed_link: "Link fixo",
    file: "Arquivo",
    single_code: "Código único",
    code_list: "Lista de códigos",
    manual: "Manual",
  };

  if (loading) return <PageLoader />;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Produtos</h1>
          <p className="text-sm text-gray-500 mt-1">{products.length} produtos cadastrados</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="draft">Rascunho</option>
          <option value="paused">Pausado</option>
          <option value="archived">Arquivado</option>
        </select>
        <select
          className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
        >
          <option value="">Todos os riscos</option>
          <option value="green">Baixo</option>
          <option value="yellow">Médio</option>
          <option value="red">Alto</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Custo</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Margem</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Entrega</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Risco</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-gray-500">
                    Nenhum produto encontrado
                  </td>
                </tr>
              )}
              {filtered.map((product) => {
                const margin = calculateMargin(product.price, product.cost);
                return (
                  <tr key={product.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-white">{product.name}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{product.slug}</p>
                    </td>
                    <td className="px-4 py-4 text-gray-400">{product.categoryName}</td>
                    <td className="px-4 py-4 text-right font-medium text-white">{formatCurrency(product.price)}</td>
                    <td className="px-4 py-4 text-right text-gray-400">{formatCurrency(product.cost)}</td>
                    <td className="px-4 py-4 text-right">
                      <span className={margin >= 0.5 ? "text-emerald-400" : margin >= 0.3 ? "text-yellow-400" : "text-red-400"}>
                        {formatPercent(margin)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-sm font-medium ${product.stock <= 3 ? "text-orange-400" : "text-gray-300"}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-400 text-xs">{deliveryTypeLabel[product.deliveryType]}</span>
                    </td>
                    <td className="px-4 py-4">
                      <ProductStatusBadge status={product.status} />
                    </td>
                    <td className="px-4 py-4">
                      <RiskBadge level={product.riskLevel} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <button className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-900/20 transition-colors" title="Editar">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDuplicate(product.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-purple-400 hover:bg-purple-900/20 transition-colors"
                          title="Duplicar"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        {product.status === "active" ? (
                          <button
                            onClick={() => handleStatusChange(product.id, "paused")}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-yellow-400 hover:bg-yellow-900/20 transition-colors"
                            title="Pausar"
                          >
                            <Pause className="h-3.5 w-3.5" />
                          </button>
                        ) : product.status === "paused" || product.status === "draft" ? (
                          <button
                            onClick={() => handleStatusChange(product.id, "active")}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-emerald-900/20 transition-colors"
                            title="Ativar"
                          >
                            <Play className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                          title="Excluir / Arquivar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
