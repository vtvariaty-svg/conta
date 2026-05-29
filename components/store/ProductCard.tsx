import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import type { ProductDoc } from "@/lib/types";

interface ProductCardProps {
  product: ProductDoc;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-2xl bg-gray-900/80 border border-gray-800 hover:border-purple-500/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/20"
    >
      <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-gray-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2 group-hover:text-purple-300 transition-colors">
          {product.name}
        </h3>
        {product.shortDescription && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.shortDescription}</p>
        )}
        <div className="flex items-center justify-between mt-4">
          <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {formatCurrency(product.price)}
          </span>
          <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
            Comprar
          </span>
        </div>
      </div>
    </Link>
  );
}
