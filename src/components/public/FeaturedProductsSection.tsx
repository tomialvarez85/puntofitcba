"use client";

import Link from "next/link";
import HorizontalSlider from "@/components/public/HorizontalSlider";
import ProductCard from "@/components/public/ProductCard";
import type { Product } from "@/types/database";

type FeaturedProduct = Product & {
  originalPrice?: number;
  discountedPrice?: number;
  hasDiscount?: boolean;
};

type FeaturedProductsSectionProps = {
  products: FeaturedProduct[];
};

export default function FeaturedProductsSection({ products }: FeaturedProductsSectionProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Productos destacados</h2>
            <p className="mt-1 text-sm text-zinc-500">Lo último que sumamos al catálogo.</p>
          </div>
          <Link href="/productos" className="hidden text-sm font-semibold text-brand hover:text-brand sm:block">
            Ver catálogo →
          </Link>
        </div>
      </div>

      <HorizontalSlider
        items={products}
        getKey={(product) => product.id}
        renderItem={(product) => <ProductCard product={product} />}
        gridClassName="md:grid-cols-3 lg:grid-cols-4"
      />
    </section>
  );
}
