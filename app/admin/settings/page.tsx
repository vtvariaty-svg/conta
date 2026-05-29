"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { PageLoader } from "@/components/ui/Spinner";

interface SettingsForm {
  storeName: string;
  supportEmail: string;
  supportWhatsapp: string;
  refundPolicy: string;
  terms: string;
  maintenanceMode: boolean;
}

export default function AdminSettings() {
  const { getToken, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm<SettingsForm>();

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const res = await fetch("/api/settings", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        reset(data);
      }
      setLoading(false);
    })();
  }, [getToken, reset]);

  const onSubmit = async (data: SettingsForm) => {
    setSaving(true);
    const token = await getToken();
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) toast.success("Configurações salvas");
    else toast.error("Erro ao salvar");
    setSaving(false);
  };

  if (loading) return <PageLoader />;
  if (role !== "admin") return <div className="p-8 text-gray-400">Acesso negado</div>;

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Configurações da Loja</h1>
        <p className="text-sm text-gray-500 mt-1">Informações gerais e políticas</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white pb-3 border-b border-gray-800">Informações Gerais</h2>
          <Input label="Nome da loja" {...register("storeName")} />
          <Input label="Email de suporte" type="email" {...register("supportEmail")} />
          <Input label="WhatsApp de suporte" placeholder="+55 11 99999-9999" {...register("supportWhatsapp")} />
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="rounded" {...register("maintenanceMode")} />
            <div>
              <span className="text-sm font-medium text-gray-300">Modo manutenção</span>
              <p className="text-xs text-gray-500">Desabilita compras na loja pública</p>
            </div>
          </label>
        </div>

        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white pb-3 border-b border-gray-800">Políticas</h2>
          <Textarea label="Política de Reembolso" rows={6} {...register("refundPolicy")} />
          <Textarea label="Termos de Uso" rows={6} {...register("terms")} />
        </div>

        <Button type="submit" loading={saving}>Salvar Configurações</Button>
      </form>
    </div>
  );
}
