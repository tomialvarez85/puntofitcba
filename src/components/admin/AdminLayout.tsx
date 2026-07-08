import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
  { label: "Productos", href: "/admin/products" },
  { label: "Categorías", href: "/admin/categories" },
  { label: "Marcas", href: "/admin/brands" },
  { label: "Combos", href: "/admin/combos" },
  { label: "Promociones", href: "/admin/promotions" },
  { label: "Cerrar sesión", href: "/admin/login" },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        <aside className="w-full border-b border-zinc-800 bg-zinc-900/80 p-6 lg:w-64 lg:border-b-0 lg:border-r">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex-shrink-0 rounded-xl bg-white p-1.5">
              <Image src="/logo-icon.png" alt="Punto Fit CBA" width={36} height={36} className="h-9 w-9" priority />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Punto Fit CBA</p>
              <h2 className="text-lg font-semibold">Panel admin</h2>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-4 py-3 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
