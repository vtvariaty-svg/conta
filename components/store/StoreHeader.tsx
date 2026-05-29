"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export function StoreHeader() {
  return (
    <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white">Loja Digital</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/products" className="text-sm text-gray-400 hover:text-white transition-colors">
            Produtos
          </Link>
          <Link href="/faq" className="text-sm text-gray-400 hover:text-white transition-colors">
            FAQ
          </Link>
          <Link href="/support" className="text-sm text-gray-400 hover:text-white transition-colors">
            Suporte
          </Link>
        </nav>
      </div>
    </header>
  );
}
