"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { deleteBrand } from "@/lib/actions/brands";
import type { Brand } from "@/types/database";

export type BrandWithProductCount = Brand & { productCount: number };

type BrandsTableProps = {
  brands: BrandWithProductCount[];
};

export default function BrandsTable({ brands }: BrandsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedBrand, setSelectedBrand] = useState<BrandWithProductCount | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!selectedBrand) {
      return;
    }

    setError(null);

    try {
      await deleteBrand(selectedBrand.id);
      setSelectedBrand(null);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la marca.");
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
                <th className="px-4 py-3 font-medium">Logo</th>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Productos</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-zinc-800/70">
                  <td className="px-4 py-4">
                    {brand.logo_url ? (
                      <img
                        src={brand.logo_url}
                        alt={brand.name}
                        className="h-10 w-10 rounded-lg bg-white object-contain p-1"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-[10px] text-zinc-500">
                        Sin logo
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">{brand.name}</p>
                  </td>
                  <td className="px-4 py-4 text-zinc-300">{brand.slug}</td>
                  <td className="px-4 py-4 text-zinc-300">{brand.productCount}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/brands/${brand.id}/edit`}
                        className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => setSelectedBrand(brand)}
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
        isOpen={Boolean(selectedBrand)}
        title="Eliminar marca"
        description={
          selectedBrand && selectedBrand.productCount > 0
            ? `${selectedBrand.name} tiene ${selectedBrand.productCount} producto${selectedBrand.productCount === 1 ? "" : "s"} asociado${selectedBrand.productCount === 1 ? "" : "s"}. Reasignalos a otra marca o a "Sin marca" antes de eliminarla.`
            : `¿Estás seguro que querés eliminar ${selectedBrand?.name ?? "esta marca"}?`
        }
        confirmLabel="Eliminar"
        isPending={isPending}
        onConfirm={() => void handleDelete()}
        onCancel={() => setSelectedBrand(null)}
      />
    </div>
  );
}
