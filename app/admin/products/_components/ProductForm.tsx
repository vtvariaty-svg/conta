"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { generateSlug } from "@/lib/utils/slug";
import { formatCurrency, formatPercent, calculateMargin } from "@/lib/utils/format";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { ProductDoc, CategoryDoc, DeliveryType, ProductStatus, RiskLevel } from "@/lib/types";

interface FaqItem {
  question: string;
  answer: string;
  sortOrder: number;
}

interface ProductFormData {
  name: string;
  slug: string;
  categoryId: string;
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  price: number;
  cost: number;
  deliveryType: DeliveryType;
  deliveryContent: string;
  status: ProductStatus;
  riskLevel: RiskLevel;
  stock: number;
  instructions: string;
  replacementPolicy: string;
  faqs: FaqItem[];
  bulkCodes: string;
}

interface ProductFormProps {
  product?: ProductDoc & { faqs?: FaqItem[] };
  onSuccess: (id: string) => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { getToken, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryDoc[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      categoryId: product?.categoryId ?? "",
      shortDescription: product?.shortDescription ?? "",
      fullDescription: product?.fullDescription ?? "",
      imageUrl: product?.imageUrl ?? "",
      price: product?.price ?? 0,
      cost: product?.cost ?? 0,
      deliveryType: product?.deliveryType ?? "fixed_link",
      deliveryContent: product?.deliveryContent ?? "",
      status: product?.status ?? "draft",
      riskLevel: product?.riskLevel ?? "green",
      stock: product?.stock ?? 0,
      instructions: product?.instructions ?? "",
      replacementPolicy: product?.replacementPolicy ?? "",
      faqs: product?.faqs ?? [],
      bulkCodes: "",
    },
  });

  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
    control,
    name: "faqs",
  });

  const watchName = watch("name");
  const watchPrice = watch("price");
  const watchCost = watch("cost");
  const watchDeliveryType = watch("deliveryType");

  useEffect(() => {
    if (!product) {
      setValue("slug", generateSlug(watchName));
    }
  }, [watchName, product, setValue]);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const res = await fetch("/api/categories", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setCategories((await res.json()).categories);
    })();
  }, [getToken]);

  const margin = calculateMargin(Number(watchPrice), Number(watchCost));

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      const token = await getToken();
      const category = categories.find((c) => c.id === data.categoryId);
      const payload = {
        ...data,
        categoryName: category?.name ?? "",
        price: Number(data.price),
        cost: Number(data.cost),
        stock: Number(data.stock),
        faqs: data.faqs.map((f, i) => ({ ...f, sortOrder: i })),
      };

      let res: Response;
      if (product) {
        res = await fetch(`/api/products/${product.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/products", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Erro ao salvar");
        return;
      }

      const result = await res.json();
      toast.success(product ? "Produto atualizado!" : "Produto criado!");

      // Add bulk codes if code_list
      if (data.deliveryType === "code_list" && data.bulkCodes.trim()) {
        const codes = data.bulkCodes.split("\n").filter((c) => c.trim());
        const pid = product?.id ?? result.id;
        await fetch(`/api/products/${pid}/stock`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ codes }),
        });
      }

      onSuccess(result.id ?? product!.id);
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = [
    { value: "", label: "Selecione a categoria" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const isAdmin = role === "admin";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
      {/* Block 1: Basic Info */}
      <section className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-5 pb-3 border-b border-gray-800">
          Informações Básicas
        </h2>
        <div className="space-y-4">
          <Input
            label="Nome do produto *"
            error={errors.name?.message}
            {...register("name", { required: "Nome obrigatório" })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Slug (URL) *"
              hint="Gerado automaticamente"
              error={errors.slug?.message}
              {...register("slug", { required: "Slug obrigatório" })}
            />
            <Select
              label="Categoria *"
              options={categoryOptions}
              error={errors.categoryId?.message}
              {...register("categoryId", { required: "Categoria obrigatória" })}
            />
          </div>
          <Input
            label="Descrição curta"
            placeholder="Resumo em 1-2 linhas"
            {...register("shortDescription")}
          />
          <Textarea
            label="Descrição completa"
            rows={5}
            placeholder="Descrição detalhada do produto..."
            {...register("fullDescription")}
          />
          <Input
            label="URL da imagem"
            type="url"
            placeholder="https://..."
            {...register("imageUrl")}
          />
        </div>
      </section>

      {/* Block 2: Price */}
      <section className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-5 pb-3 border-b border-gray-800">
          Preço e Margem
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Preço de venda (R$) *"
            type="number"
            step="0.01"
            min="0.01"
            error={errors.price?.message}
            {...register("price", { required: "Preço obrigatório", min: { value: 0.01, message: "Preço deve ser maior que zero" } })}
          />
          <Input
            label="Custo unitário (R$)"
            type="number"
            step="0.01"
            min="0"
            {...register("cost", { min: { value: 0, message: "Custo não pode ser negativo" } })}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-300">Margem estimada</label>
            <div className="flex items-center h-10 px-4 bg-gray-800/30 border border-gray-700 rounded-xl">
              <span className={`text-sm font-semibold ${margin >= 0.5 ? "text-emerald-400" : margin >= 0.3 ? "text-yellow-400" : "text-red-400"}`}>
                {formatPercent(margin)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Block 3: Status */}
      <section className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-5 pb-3 border-b border-gray-800">
          Status e Risco
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status *"
            options={[
              { value: "draft", label: "Rascunho" },
              { value: "active", label: "Ativo" },
              { value: "paused", label: "Pausado" },
              { value: "archived", label: "Arquivado" },
            ]}
            {...register("status")}
          />
          <Select
            label="Risco Operacional *"
            options={[
              { value: "green", label: "Baixo (verde)" },
              { value: "yellow", label: "Médio (amarelo)" },
              { value: "red", label: "Alto (vermelho)" },
            ]}
            {...register("riskLevel")}
          />
        </div>
      </section>

      {/* Block 4: Delivery */}
      <section className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-5 pb-3 border-b border-gray-800">
          Entrega
        </h2>
        <div className="space-y-4">
          <Select
            label="Tipo de entrega *"
            options={[
              { value: "fixed_link", label: "Link fixo (mesmo para todos)" },
              { value: "file", label: "Arquivo / link de download" },
              { value: "single_code", label: "Código único fixo" },
              { value: "code_list", label: "Lista de códigos únicos" },
              { value: "manual", label: "Manual (admin finaliza)" },
            ]}
            {...register("deliveryType")}
          />

          {watchDeliveryType !== "manual" && watchDeliveryType !== "code_list" && (
            <Input
              label="Conteúdo de entrega *"
              placeholder={
                watchDeliveryType === "fixed_link"
                  ? "https://link-do-produto.com"
                  : watchDeliveryType === "file"
                  ? "URL do arquivo"
                  : "CODIGO-UNICO-123"
              }
              error={errors.deliveryContent?.message}
              {...register("deliveryContent", {
                required: "Conteúdo de entrega obrigatório",
              })}
            />
          )}

          {watchDeliveryType === "code_list" && (
            <div>
              <Textarea
                label={product ? "Adicionar novos códigos (um por linha)" : "Códigos (um por linha) *"}
                rows={6}
                placeholder={"CODIGO-001\nCODIGO-002\nCODIGO-003"}
                hint="Cada linha será um código único no estoque digital"
                {...register("bulkCodes", {
                  required: !product ? "Adicione pelo menos um código" : false,
                })}
              />
              <Input
                label="Estoque atual"
                type="number"
                min="0"
                hint="Será atualizado automaticamente ao adicionar códigos"
                {...register("stock")}
              />
            </div>
          )}

          {watchDeliveryType !== "code_list" && (
            <Input
              label="Estoque"
              type="number"
              min="0"
              {...register("stock")}
            />
          )}
        </div>
      </section>

      {/* Block 5: Post-sale */}
      <section className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-5 pb-3 border-b border-gray-800">
          Pós-venda e FAQ
        </h2>
        <div className="space-y-4">
          <Textarea
            label="Instruções de uso"
            rows={3}
            placeholder="Instruções enviadas ao cliente após a compra..."
            {...register("instructions")}
          />
          <Textarea
            label="Política de reposição"
            rows={2}
            placeholder="Ex: Reposição garantida por 7 dias se o código não funcionar..."
            {...register("replacementPolicy")}
          />

          {/* FAQs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300">FAQ do produto</label>
              <button
                type="button"
                onClick={() => appendFaq({ question: "", answer: "", sortOrder: faqFields.length })}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Adicionar pergunta
              </button>
            </div>
            <div className="space-y-3">
              {faqFields.map((field, index) => (
                <div key={field.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Pergunta {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeFaq(index)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Input placeholder="Pergunta..." {...register(`faqs.${index}.question`)} />
                  <Textarea placeholder="Resposta..." rows={2} {...register(`faqs.${index}.answer`)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit" loading={loading}>
          {product ? "Salvar alterações" : "Criar produto"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => history.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
