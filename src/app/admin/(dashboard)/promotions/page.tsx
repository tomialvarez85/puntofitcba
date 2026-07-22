import Link from "next/link";
import PromotionsTable from "@/components/admin/PromotionsTable";
import { getPromotions } from "@/lib/data/promotions";

export default async function AdminPromotionsPage() {
  const promotions = await getPromotions();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Promociones</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Gestioná reglas de descuento temporales sobre productos y combos existentes.
          </p>
        </div>

        <Link
          href="/admin/promotions/new"
          className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark"
        >
          Nueva promoción
        </Link>
      </div>

      {promotions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-10 text-center text-zinc-400">
          Aún no hay promociones creadas. Creá la primera para comenzar.
        </div>
      ) : (
        <PromotionsTable promotions={promotions} />
      )}
    </div>
  );
}
