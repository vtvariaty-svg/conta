import React from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
}

export function Card({ children, className, glass }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border",
        glass
          ? "bg-white/5 border-white/10 backdrop-blur-md"
          : "bg-gray-900/80 border-gray-800",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-6 py-4 border-b border-gray-800", className)}>{children}</div>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  gradient?: string;
}

export function KPICard({ title, value, subtitle, icon, gradient }: KPICardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 border border-gray-800/50 relative overflow-hidden",
        gradient ?? "bg-gray-900/80"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
