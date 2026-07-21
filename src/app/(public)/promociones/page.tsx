import { Suspense } from "react";
import Link from "next/link";
import ComboCard from "@/components/public/ComboCard";
import ProductCard from "@/components/public/ProductCard";
import PromotionsSortSelect from "@/components/public/PromotionsSortSelect";
import { getActivePromotedItems } from "@/lib/data/public";
import type { PromotedSortBy } from "@/lib/data/public";

const VALID_SORTS: PromotedSortBy[] = ["discount_desc", "newest"];

type PromocionesPageProps = {
  searchParams: Promise<{ orden?: string }>;
};

export default async function PromocionesPage({ searchParams }: PromocionesPageProps) {
  const params = await searchParams;
  const sortBy = VALID_SORTS.includes(params.orden as PromotedSortBy) ? (params.orden as PromotedSortBy) : "discount_desc";

  const items = await getActivePromotedItems({ sortBy });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Promociones activas</h1>
        <p className="mt-1 text-sm text-zinc-400">Productos y combos con descuento por tiempo limitado.</p>
      </div>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 p-10 text-center text-zinc-400">
          <p>No hay promociones activas en este momento.</p>
          <Link href="/productos" className="mt-3 inline-block text-sm font-semibold text-brand-tint hover:underline">
            Mirá nuestro catálogo completo →
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 flex justify-end">
            <Suspense fallback={null}>
              <PromotionsSortSelect />
            </Suspense>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {items.map((item) =>
              item.type === "product" ? (
                <ProductCard key={`product-${item.data.id}`} product={item.data} />
              ) : (
                <ComboCard key={`combo-${item.data.id}`} combo={item.data} />
              ),
            )}
          </div>
        </>
      )}
    </div>
  );
}
