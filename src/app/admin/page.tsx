import Link from "next/link";
import { Award, ArrowRight, FolderTree, Layers, Package, PackageX, Percent, Plus, TriangleAlert } from "lucide-react";
import { getDashboardStats } from "@/lib/data/dashboard";

export default async function AdminPage() {
  const stats = await getDashboardStats();

  const statCards = [
    { label: "Productos activos", value: stats.activeProducts, icon: Package, alert: false },
    { label: "Sin stock", value: stats.outOfStockProducts, icon: PackageX, alert: stats.outOfStockProducts > 0 },
    { label: "Combos activos", value: stats.activeCombos, icon: Layers, alert: false },
    { label: "Promociones activas", value: stats.activePromotions, icon: Percent, alert: false },
    { label: "Marcas", value: stats.totalBrands, icon: Award, alert: false },
    { label: "Categorías", value: stats.totalCategories, icon: FolderTree, alert: false },
  ];

  const quickLinks = [
    { label: "Nuevo producto", href: "/admin/products/new" },
    { label: "Nuevo combo", href: "/admin/combos/new" },
    { label: "Nueva promoción", href: "/admin/promotions/new" },
  ];

  return (
    <div className="space-y-6">
      {stats.outOfStockProducts > 0 ? (
        <Link
          href="/admin/products"
          className="flex items-center gap-3 rounded-2xl border border-amber-700/40 bg-amber-950/20 p-4 text-sm text-amber-300 transition hover:bg-amber-950/30"
        >
          <TriangleAlert size={20} className="flex-shrink-0 text-amber-400" />
          <span>
            Tenés <strong>{stats.outOfStockProducts}</strong> producto{stats.outOfStockProducts === 1 ? "" : "s"} sin
            stock. Revisá el catálogo para reponerlos.
          </span>
        </Link>
      ) : null}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
        <h1 className="text-2xl font-semibold text-white">Bienvenido de nuevo</h1>
        <p className="mt-1 text-sm text-zinc-400">Este es el resumen de Punto Fit CBA.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className={`rounded-2xl border p-5 shadow-xl ${
                card.alert ? "border-amber-700/40 bg-amber-950/20" : "border-zinc-800 bg-zinc-900/70"
              }`}
            >
              <Icon size={20} className={card.alert ? "text-amber-400" : "text-brand-tint"} />
              <p className={`mt-3 text-3xl font-bold ${card.alert ? "text-amber-300" : "text-white"}`}>
                {card.value}
              </p>
              <p className="mt-1 text-xs text-zinc-400">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-white">Accesos rápidos</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between gap-3 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-4 text-sm font-medium text-zinc-200 transition hover:border-brand hover:bg-zinc-900"
            >
              <span className="flex items-center gap-2">
                <Plus size={18} className="text-brand-tint" />
                {link.label}
              </span>
              <ArrowRight size={16} className="text-zinc-500" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
