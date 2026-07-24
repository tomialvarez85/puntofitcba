"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteCombo, toggleComboActive } from "@/lib/actions/combos";
import { formatPrice } from "@/lib/utils/format";
import type { ComboWithItems } from "@/types/database";

type CombosTableProps = {
  combos: ComboWithItems[];
};

export default function CombosTable({ combos }: CombosTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedCombo, setSelectedCombo] = useState<ComboWithItems | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!selectedCombo) {
      return;
    }

    setError(null);

    try {
      await deleteCombo(selectedCombo.id);
      setSelectedCombo(null);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el combo.");
    }
  };

  const handleToggle = async (combo: ComboWithItems) => {
    setError(null);

    try {
      await toggleComboActive(combo.id, !combo.active);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el estado del combo.");
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
                <th className="px-4 py-3 font-medium">Combo</th>
                <th className="px-4 py-3 font-medium">Precio</th>
                <th className="px-4 py-3 font-medium">Productos</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {combos.map((combo) => {
                const items = Array.isArray(combo.items) ? combo.items : [];

                return (
                  <tr key={combo.id} className="hover:bg-zinc-800/70">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {combo.image_url ? (
                          <Image
                            src={combo.image_url}
                            alt={combo.name}
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
                          <p className="font-medium text-white">{combo.name}</p>
                          <p className="text-xs text-zinc-500">{combo.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-zinc-300">{formatPrice(Number(combo.price))}</td>
                    <td className="px-4 py-4 text-zinc-300">{items.length}</td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => void handleToggle(combo)}
                        disabled={isPending}
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium transition ${
                          combo.active
                            ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                            : "bg-zinc-700/70 text-zinc-300 hover:bg-zinc-600"
                        } ${isPending ? "cursor-not-allowed opacity-70" : ""}`}
                      >
                        {combo.active ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/combos/${combo.id}/edit`}
                          className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSelectedCombo(combo)}
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

      {selectedCombo ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-white">Eliminar combo</h2>
            <p className="mt-2 text-sm text-zinc-400">
              ¿Estás seguro que querés eliminar <span className="font-medium text-white">{selectedCombo.name}</span>?
            </p>
            <p className="mt-3 text-sm text-red-300">Esta acción eliminará también su imagen y no se puede deshacer.</p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedCombo(null)}
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
