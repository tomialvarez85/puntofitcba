"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Brand, Category } from "@/types/database";

const SORT_OPTIONS: { value: "newest" | "price_asc" | "price_desc"; label: string }[] = [
  { value: "newest", label: "Más nuevo" },
  { value: "price_asc", label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
];

type CatalogFiltersProps = {
  categories?: Category[];
  brands?: Brand[];
};

export default function CatalogFilters({ categories = [], brands = [] }: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("categoria") ?? "";
  const activeBrand = searchParams.get("marca") ?? "";
  const activeSort = searchParams.get("orden") ?? "newest";
  const activeSearch = searchParams.get("buscar") ?? "";
  const [searchInput, setSearchInput] = useState(activeSearch);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (searchInput === (searchParams.get("buscar") ?? "")) {
      return;
    }

    const timeout = setTimeout(() => {
      updateParams({ buscar: searchInput || null });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 400);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  function updateParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(next).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const hasActiveFilters = Boolean(activeCategory || activeBrand || activeSearch || activeSort !== "newest");

  const clearFilters = () => {
    setSearchInput("");
    router.replace(pathname, { scroll: false });
    setIsMobileOpen(false);
  };

  const categoryChips = categories.length > 0 && (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => updateParams({ categoria: null })}
        className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
          activeCategory === ""
            ? "bg-brand text-white"
            : "border border-zinc-300 text-zinc-600 hover:border-brand-dark"
        }`}
      >
        Todas
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => updateParams({ categoria: category.slug })}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
            activeCategory === category.slug
              ? "bg-brand text-white"
              : "border border-zinc-300 text-zinc-600 hover:border-brand-dark"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );

  const brandChips = brands.length > 0 && (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => updateParams({ marca: null })}
        className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
          activeBrand === ""
            ? "bg-brand text-white"
            : "border border-zinc-300 text-zinc-600 hover:border-brand-dark"
        }`}
      >
        Todas
      </button>
      {brands.map((brand) => (
        <button
          key={brand.id}
          type="button"
          onClick={() => updateParams({ marca: brand.slug })}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
            activeBrand === brand.slug
              ? "bg-brand text-white"
              : "border border-zinc-300 text-zinc-600 hover:border-brand-dark"
          }`}
        >
          {brand.name}
        </button>
      ))}
    </div>
  );

  const sortSelect = (
    <select
      value={activeSort}
      onChange={(event) => updateParams({ orden: event.target.value })}
      className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 outline-none"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  return (
    <div className="mb-2">
      <div className="flex gap-2 sm:hidden">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Buscar..."
            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 outline-none focus:border-brand-dark"
          />
        </div>
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="relative flex flex-shrink-0 items-center justify-center rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700"
        >
          <SlidersHorizontal size={16} />
          {hasActiveFilters ? (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-brand" />
          ) : null}
        </button>
      </div>

      {isMobileOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/50 sm:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          <div className="w-full rounded-t-2xl bg-white p-5" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-900">Filtros</h2>
              <button type="button" onClick={() => setIsMobileOpen(false)} aria-label="Cerrar filtros">
                <X size={20} className="text-zinc-500" />
              </button>
            </div>

            {categoryChips ? (
              <div className="mb-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Categoría</p>
                {categoryChips}
              </div>
            ) : null}

            {brandChips ? (
              <div className="mb-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Marca</p>
                {brandChips}
              </div>
            ) : null}

            <div className="mb-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Ordenar por</p>
              {sortSelect}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700"
              >
                Limpiar filtros
              </button>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="flex-1 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="hidden flex-wrap items-center gap-4 sm:flex">
        <div className="relative w-64">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Buscar..."
            className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 outline-none focus:border-brand-dark"
          />
        </div>

        {categoryChips}

        {brandChips}

        {sortSelect}

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-zinc-500 hover:text-brand hover:underline"
          >
            Limpiar filtros
          </button>
        ) : null}
      </div>
    </div>
  );
}
