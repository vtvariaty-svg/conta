"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { generateSlug } from "@/lib/utils/slug";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import type { CategoryDoc } from "@/lib/types";

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  status: "active" | "inactive";
}

export default function AdminCategories() {
  const { getToken } = useAuth();
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CategoryDoc | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<CategoryForm>({
      defaultValues: { status: "active" },
    });

  const watchName = watch("name");
  useEffect(() => {
    if (!editing) setValue("slug", generateSlug(watchName ?? ""));
  }, [watchName, editing, setValue]);

  async function fetchCategories() {
    const token = await getToken();
    const res = await fetch("/api/categories", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setCategories((await res.json()).categories);
    setLoading(false);
  }

  useEffect(() => { fetchCategories(); }, []);

  function startEdit(cat: CategoryDoc) {
    setEditing(cat);
    setShowForm(true);
    reset({ name: cat.name, slug: cat.slug, description: cat.description, status: cat.status });
  }

  function startNew() {
    setEditing(null);
    setShowForm(true);
    reset({ name: "", slug: "", description: "", status: "active" });
  }

  async function onSubmit(data: CategoryForm) {
    const token = await getToken();
    if (editing) {
      await fetch(`/api/categories/${editing.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast.success("Categoria atualizada");
    } else {
      await fetch("/api/categories", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast.success("Categoria criada");
    }
    setShowForm(false);
    fetchCategories();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir categoria "${name}"?`)) return;
    const token = await getToken();
    await fetch(`/api/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("Categoria excluída");
    fetchCategories();
  }

  if (loading) return <PageLoader />;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Categorias</h1>
          <p className="text-sm text-gray-500 mt-1">{categories.length} categorias</p>
        </div>
        <Button onClick={startNew}>
          <Plus className="h-4 w-4" /> Nova Categoria
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white text-sm">{editing ? "Editar Categoria" : "Nova Categoria"}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nome *" error={errors.name?.message} {...register("name", { required: "Nome obrigatório" })} />
              <Input label="Slug" hint="Gerado automaticamente" {...register("slug")} />
            </div>
            <Textarea label="Descrição" rows={2} {...register("description")} />
            <Select
              label="Status"
              options={[{ value: "active", label: "Ativa" }, { value: "inactive", label: "Inativa" }]}
              {...register("status")}
            />
            <div className="flex gap-3">
              <Button type="submit" size="sm">{editing ? "Salvar" : "Criar"}</Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-800/30">
                <td className="px-6 py-4 font-medium text-white">{cat.name}</td>
                <td className="px-4 py-4 text-gray-500 text-xs">{cat.slug}</td>
                <td className="px-4 py-4">
                  <Badge variant={cat.status === "active" ? "green" : "gray"}>
                    {cat.status === "active" ? "Ativa" : "Inativa"}
                  </Badge>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => startEdit(cat)} className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-900/20 transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={4} className="text-center py-10 text-gray-500">Nenhuma categoria cadastrada</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
