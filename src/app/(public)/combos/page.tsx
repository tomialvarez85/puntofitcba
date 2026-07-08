import { Suspense } from "react";
import CatalogFilters from "@/components/public/CatalogFilters";
import ComboCard from "@/components/public/ComboCard";
import { getCatalogCombos } from "@/lib/data/public";
import type { CatalogSortBy } from "@/lib/data/public";

const VALID_SORTS: CatalogSortBy[] = ["newest", "price_asc", "price_desc"];

type CombosPageProps = {
  searchParams: Promise<{ buscar?: string; orden?: string }>;
};

export default async function CombosPage({ searchParams }: CombosPageProps) {
  const params = await searchParams;
  const searchTerm = params.buscar || undefined;
  const sortBy = VALID_SORTS.includes(params.orden as CatalogSortBy) ? (params.orden as CatalogSortBy) : "newest";

  const combos = await getCatalogCombos({ searchTerm, sortBy });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Combos</h1>
        <p className="mt-1 text-sm text-zinc-500">Ahorrá más llevando el pack completo.</p>
      </div>

      <Suspense fallback={null}>
        <CatalogFilters />
      </Suspense>

      {combos.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center text-zinc-500">
          No se encontraron combos con estos filtros.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {combos.map((combo) => (
            <ComboCard key={combo.id} combo={combo} />
          ))}
        </div>
      )}
    </div>
  );
}
