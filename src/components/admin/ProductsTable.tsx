"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteProduct, toggleProductActive } from "@/lib/actions/products";
import type { Product } from "@/types/database";

type ProductsTableProps = {
  products: Product[];
};

export default function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!selectedProduct) {
      return;
    }

    setError(null);

    try {
      await deleteProduct(selectedProduct.id);
      setSelectedProduct(null);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el producto.");
    }
  };

  const handleToggle = async (product: Product) => {
    setError(null);

    try {
      await toggleProductActive(product.id, !product.active);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el estado del producto.");
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
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Marca</th>
                <th className="px-4 py-3 font-medium">Precio</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {products.map((product) => {
                const primaryImage = product.images?.find((image) => image.is_primary) ?? product.images?.[0];
                const categoryName = product.category?.name ?? "Sin categoría";
                const brandName = product.brand?.name ?? "Sin marca";

                return (
                  <tr key={product.id} className="hover:bg-zinc-800/70">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {primaryImage ? (
                          <Image
                            src={primaryImage.url}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800 text-xs text-zinc-500">
                            Sin foto
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white">{product.name}</p>
                          <p className="text-xs text-zinc-500">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-zinc-300">{categoryName}</td>
                    <td className="px-4 py-4 text-zinc-300">{brandName}</td>
                    <td className="px-4 py-4 text-zinc-300">${Number(product.price).toFixed(2)}</td>
                    <td className="px-4 py-4 text-zinc-300">{product.stock}</td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => void handleToggle(product)}
                        disabled={isPending}
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium transition ${
                          product.active
                            ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                            : "bg-zinc-700/70 text-zinc-300 hover:bg-zinc-600"
                        } ${isPending ? "cursor-not-allowed opacity-70" : ""}`}
                      >
                        {product.active ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(product)}
                          disabled={isPending}
                          className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProduct ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-white">Eliminar producto</h2>
            <p className="mt-2 text-sm text-zinc-400">
              ¿Estás seguro que querés eliminar <span className="font-medium text-white">{selectedProduct.name}</span>?
            </p>
            <p className="mt-3 text-sm text-red-300">
              Esta acción eliminará también sus imágenes y no se puede deshacer.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
