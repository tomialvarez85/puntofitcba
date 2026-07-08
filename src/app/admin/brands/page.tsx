import Link from "next/link";
import BrandsTable from "@/components/admin/BrandsTable";
import { getBrands, getBrandProductCount } from "@/lib/data/brands";

export default async function AdminBrandsPage() {
  const brands = await getBrands();
  const brandsWithCounts = await Promise.all(
    brands.map(async (brand) => ({
      ...brand,
      productCount: await getBrandProductCount(brand.id),
    })),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Marcas</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Gestioná las marcas de tus productos.
          </p>
        </div>

        <Link
          href="/admin/brands/new"
          className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark"
        >
          Nueva marca
        </Link>
      </div>

      {brandsWithCounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-10 text-center text-zinc-400">
          Aún no hay marcas creadas. Creá la primera para comenzar.
        </div>
      ) : (
        <BrandsTable brands={brandsWithCounts} />
      )}
    </div>
  );
}
