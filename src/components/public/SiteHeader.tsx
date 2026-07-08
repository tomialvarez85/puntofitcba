"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

const navItems = [
  { label: "Catálogo", href: "/productos" },
  { label: "Combos", href: "/combos" },
  { label: "Promociones", href: "/promociones" },
];

export default function SiteHeader() {
  const { totalItems, openCart } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white text-zinc-900">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 leading-none">
          <Image src="/logo-icon.png" alt="Punto Fit CBA" width={40} height={40} className="h-10 w-10" priority />
          <span className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-brand">PUNTO FIT CBA</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-400">Suplementos</span>
          </span>
        </Link>

        <nav className="order-3 flex w-full items-center gap-5 overflow-x-auto text-sm font-medium text-zinc-600 sm:order-none sm:w-auto sm:gap-6">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap transition hover:text-brand">
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={openCart}
          aria-label={`Carrito de compras, ${totalItems} producto${totalItems === 1 ? "" : "s"}`}
          className="relative inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 transition hover:bg-zinc-100"
        >
          <ShoppingCart size={18} />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
            {totalItems}
          </span>
        </button>
      </div>
    </header>
  );
}
