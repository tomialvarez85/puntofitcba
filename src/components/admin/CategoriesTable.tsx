"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { deleteCategory } from "@/lib/actions/categories";
import type { Category } from "@/types/database";

export type CategoryWithProductCount = Category & { productCount: number };

type CategoriesTableProps = {
  categories: CategoryWithProductCount[];
};

export default function CategoriesTable({ categories }: CategoriesTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithProductCount | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!selectedCategory) {
      return;
    }

    setError(null);

    try {
      await deleteCategory(selectedCategory.id);
      setSelectedCategory(null);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la categoría.");
    }
  };

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-xl border border-red-700/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-800 text-sm">
            <thead className="bg-zinc-950/70 text-left text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Productos</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-zinc-800/70">
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">{category.name}</p>
                  </td>
                  <td className="px-4 py-4 text-zinc-300">{category.slug}</td>
                  <td className="px-4 py-4 text-zinc-300">{category.productCount}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/categories/${category.id}/edit`}
                        className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        disabled={isPending}
                        className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(selectedCategory)}
        title="Eliminar categoría"
        description={
          selectedCategory && selectedCategory.productCount > 0
            ? `${selectedCategory.name} tiene ${selectedCategory.productCount} producto${selectedCategory.productCount === 1 ? "" : "s"} asociado${selectedCategory.productCount === 1 ? "" : "s"}. Reasignalos a otra categoría o a "Sin categoría" antes de eliminarla.`
            : `¿Estás seguro que querés eliminar ${selectedCategory?.name ?? "esta categoría"}?`
        }
        confirmLabel="Eliminar"
        isPending={isPending}
        onConfirm={() => void handleDelete()}
        onCancel={() => setSelectedCategory(null)}
      />
    </div>
  );
}
