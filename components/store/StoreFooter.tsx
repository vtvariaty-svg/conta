import Link from "next/link";
import { Zap } from "lucide-react";

export function StoreFooter() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-white text-sm">Loja Digital</span>
          </Link>

          <nav className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Termos de Uso</Link>
            <Link href="/refund-policy" className="hover:text-gray-300 transition-colors">Política de Reembolso</Link>
            <Link href="/faq" className="hover:text-gray-300 transition-colors">FAQ</Link>
            <Link href="/support" className="hover:text-gray-300 transition-colors">Suporte</Link>
          </nav>

          <p className="text-xs text-gray-600">© {new Date().getFullYear()} Loja Digital. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
