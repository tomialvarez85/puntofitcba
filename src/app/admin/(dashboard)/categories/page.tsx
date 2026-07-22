import Link from "next/link";
import CategoriesTable from "@/components/admin/CategoriesTable";
import { getCategories, getCategoryProductCount } from "@/lib/data/categories";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => ({
      ...category,
      productCount: await getCategoryProductCount(category.id),
    })),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Categorías</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Organizá tus productos agrupándolos por categoría.
          </p>
        </div>

        <Link
          href="/admin/categories/new"
          className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark"
        >
          Nueva categoría
        </Link>
      </div>

      {categoriesWithCounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-10 text-center text-zinc-400">
          Aún no hay categorías creadas. Creá la primera para comenzar.
        </div>
      ) : (
        <CategoriesTable categories={categoriesWithCounts} />
      )}
    </div>
  );
}
