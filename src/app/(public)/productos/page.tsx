import { Suspense } from "react";
import CatalogFilters from "@/components/public/CatalogFilters";
import ProductCard from "@/components/public/ProductCard";
import { getBrandsWithProducts, getCatalogProducts, getCategories } from "@/lib/data/public";
import type { CatalogSortBy } from "@/lib/data/public";

const VALID_SORTS: CatalogSortBy[] = ["newest", "price_asc", "price_desc"];

type ProductsPageProps = {
  searchParams: Promise<{ categoria?: string; marca?: string; buscar?: string; orden?: string; carrito?: string }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const categorySlug = params.categoria || undefined;
  const brandSlug = params.marca || undefined;
  const searchTerm = params.buscar || undefined;
  const sortBy = VALID_SORTS.includes(params.orden as CatalogSortBy) ? (params.orden as CatalogSortBy) : "newest";

  const [products, categories, brands] = await Promise.all([
    getCatalogProducts({ categorySlug, brandSlug, searchTerm, sortBy }),
    getCategories(),
    getBrandsWithProducts(categorySlug),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {params.carrito === "vacio" ? (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          Tu carrito estaba vacío. Elegí tus productos favoritos para armar tu pedido.
        </div>
      ) : null}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Catálogo</h1>
        <p className="mt-1 text-sm text-zinc-400">Encontrá el producto ideal para tu entrenamiento.</p>
      </div>

      <Suspense fallback={null}>
        <CatalogFilters categories={categories} brands={brands} />
      </Suspense>

      {products.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 p-10 text-center text-zinc-400">
          No se encontraron productos con estos filtros.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
