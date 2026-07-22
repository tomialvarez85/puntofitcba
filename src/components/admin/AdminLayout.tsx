"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import SignOutButton from "@/components/admin/SignOutButton";
import { signOut } from "@/lib/actions/auth";

const navItems = [
  { label: "Productos", href: "/admin/products" },
  { label: "Categorías", href: "/admin/categories" },
  { label: "Marcas", href: "/admin/brands" },
  { label: "Combos", href: "/admin/combos" },
  { label: "Promociones", href: "/admin/promotions" },
  { label: "Testimonios", href: "/admin/testimonials" },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
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
            onClick={onNavigate}
            className="block rounded-lg px-4 py-3 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            {item.label}
          </Link>
        ))}

        <form action={signOut}>
          <SignOutButton />
        </form>
      </nav>
    </>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-4 py-3 md:hidden">
        <div className="flex items-center gap-2.5">
          <span className="flex-shrink-0 rounded-lg bg-white p-1">
            <Image src="/logo-icon.png" alt="Punto Fit CBA" width={28} height={28} className="h-7 w-7" priority />
          </span>
          <span className="text-sm font-semibold">Panel admin</span>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={isMenuOpen}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-zinc-300 transition hover:bg-zinc-800"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col md:flex-row">
        <aside className="hidden w-64 flex-shrink-0 border-r border-zinc-800 bg-zinc-900/80 p-6 md:block">
          <SidebarNav />
        </aside>

        <div
          onClick={() => setIsMenuOpen(false)}
          aria-hidden={!isMenuOpen}
          className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 md:hidden ${
            isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[80%] overflow-y-auto border-r border-zinc-800 bg-zinc-900 p-6 shadow-2xl transition-transform duration-300 ease-out md:hidden ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Cerrar menú"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <SidebarNav onNavigate={() => setIsMenuOpen(false)} />
        </aside>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
