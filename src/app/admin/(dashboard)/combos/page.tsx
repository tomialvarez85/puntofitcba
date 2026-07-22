import Link from "next/link";
import { getCombos } from "@/lib/data/combos";
import CombosTable from "@/components/admin/CombosTable";

export default async function AdminCombosPage() {
  const combos = await getCombos();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Combos</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Armá paquetes de productos para ofrecer promociones y ventas combinadas.
          </p>
        </div>

        <Link
          href="/admin/combos/new"
          className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark"
        >
          Nuevo combo
        </Link>
      </div>

      {combos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-10 text-center text-zinc-400">
          Aún no hay combos cargados. Creá el primero para comenzar.
        </div>
      ) : (
        <CombosTable combos={combos} />
      )}
    </div>
  );
}
