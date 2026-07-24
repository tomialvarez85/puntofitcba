"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { deletePromotion } from "@/lib/actions/promotions";
import { formatPrice } from "@/lib/utils/format";
import { getPromotionStatus } from "@/lib/utils/promotion-status";
import type { PromotionWithLinks } from "@/types/database";

type PromotionsTableProps = {
  promotions: PromotionWithLinks[];
};

export default function PromotionsTable({ promotions }: PromotionsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedPromotion, setSelectedPromotion] = useState<PromotionWithLinks | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!selectedPromotion) {
      return;
    }

    setError(null);

    try {
      await deletePromotion(selectedPromotion.id);
      setSelectedPromotion(null);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la promoción.");
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
                <th className="px-4 py-3 font-medium">Promoción</th>
                <th className="px-4 py-3 font-medium">Descuento</th>
                <th className="px-4 py-3 font-medium">Afecta a</th>
                <th className="px-4 py-3 font-medium">Vigencia</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {promotions.map((promotion) => {
                const labels = (promotion.links ?? [])
                  .map((link) => link.product?.name ?? link.combo?.name)
                  .filter(Boolean)
                  .slice(0, 3);
                const status = getPromotionStatus(promotion.start_date, promotion.end_date, promotion.active);

                return (
                  <tr key={promotion.id} className="hover:bg-zinc-800/70">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-white">{promotion.name}</p>
                        <p className="mt-1 text-xs text-zinc-500">{promotion.description ?? "Sin descripción"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-zinc-300">
                      {promotion.discount_type === "percentage"
                        ? `${promotion.discount_value ?? 0}% OFF`
                        : promotion.discount_type === "fixed_amount"
                          ? `${formatPrice(Number(promotion.discount_value ?? 0))} OFF`
                          : "2x1"}
                    </td>
                    <td className="px-4 py-4">
                      {labels.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {labels.map((label) => (
                            <span key={label} className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs text-zinc-200">
                              {label}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-500">Sin vínculos</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-300">
                      <div className="text-xs text-zinc-400">
                        <div>{new Date(promotion.start_date).toLocaleString()}</div>
                        <div>{new Date(promotion.end_date).toLocaleString()}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          status === "Activa"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : status === "Programada"
                              ? "bg-sky-500/15 text-sky-400"
                              : status === "Pausada"
                                ? "bg-amber-500/15 text-amber-400"
                                : "bg-zinc-700/70 text-zinc-300"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/promotions/${promotion.id}/edit`}
                          className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSelectedPromotion(promotion)}
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

      <ConfirmDialog
        isOpen={Boolean(selectedPromotion)}
        title="Eliminar promoción"
        description={`¿Estás seguro que querés eliminar ${selectedPromotion?.name ?? "esta promoción"}?`}
        confirmLabel="Eliminar"
        isPending={isPending}
        onConfirm={() => void handleDelete()}
        onCancel={() => setSelectedPromotion(null)}
      />
    </div>
  );
}
