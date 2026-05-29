import React from "react";
import { cn } from "@/lib/utils/cn";
import type { ProductStatus, PaymentStatus, DeliveryStatus, RiskLevel, StockStatus } from "@/lib/types";

type BadgeVariant = "green" | "yellow" | "red" | "blue" | "purple" | "gray" | "orange";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  green: "bg-emerald-900/50 text-emerald-400 border-emerald-700/50",
  yellow: "bg-yellow-900/50 text-yellow-400 border-yellow-700/50",
  red: "bg-red-900/50 text-red-400 border-red-700/50",
  blue: "bg-blue-900/50 text-blue-400 border-blue-700/50",
  purple: "bg-purple-900/50 text-purple-400 border-purple-700/50",
  gray: "bg-gray-800/50 text-gray-400 border-gray-700/50",
  orange: "bg-orange-900/50 text-orange-400 border-orange-700/50",
};

export function Badge({ variant = "gray", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const map: Record<ProductStatus, { label: string; variant: BadgeVariant }> = {
    active: { label: "Ativo", variant: "green" },
    draft: { label: "Rascunho", variant: "gray" },
    paused: { label: "Pausado", variant: "yellow" },
    archived: { label: "Arquivado", variant: "red" },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, { label: string; variant: BadgeVariant }> = {
    pending: { label: "Pendente", variant: "yellow" },
    paid: { label: "Pago", variant: "green" },
    failed: { label: "Falhou", variant: "red" },
    expired: { label: "Expirado", variant: "gray" },
    refunded: { label: "Reembolsado", variant: "blue" },
    canceled: { label: "Cancelado", variant: "gray" },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  const map: Record<DeliveryStatus, { label: string; variant: BadgeVariant }> = {
    pending: { label: "Pendente", variant: "yellow" },
    delivered: { label: "Entregue", variant: "green" },
    failed: { label: "Falhou", variant: "red" },
    manual_required: { label: "Manual", variant: "orange" },
    resent: { label: "Reenviado", variant: "blue" },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const map: Record<RiskLevel, { label: string; variant: BadgeVariant }> = {
    green: { label: "Baixo", variant: "green" },
    yellow: { label: "Médio", variant: "yellow" },
    red: { label: "Alto", variant: "red" },
  };
  const { label, variant } = map[level];
  return <Badge variant={variant}>{label}</Badge>;
}

export function StockStatusBadge({ status }: { status: StockStatus }) {
  const map: Record<StockStatus, { label: string; variant: BadgeVariant }> = {
    available: { label: "Disponível", variant: "green" },
    reserved: { label: "Reservado", variant: "yellow" },
    delivered: { label: "Entregue", variant: "blue" },
    blocked: { label: "Bloqueado", variant: "red" },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}
