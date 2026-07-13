"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { Category } from "@/types/database";

const navItems = [
  { label: "Combos", href: "/combos" },
  { label: "Promociones", href: "/promociones" },
];

type SiteHeaderProps = {
  categories: Category[];
};

export default function SiteHeader({ categories }: SiteHeaderProps) {
  const { totalItems, openCart } = useCart();
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const productsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (productsMenuRef.current && !productsMenuRef.current.contains(event.target as Node)) {
        setIsProductsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProductsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

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

        <nav className="order-3 flex w-full flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-zinc-600 sm:order-none sm:w-auto sm:flex-nowrap sm:gap-x-6">
          <div ref={productsMenuRef} className="group relative">
            <div className="flex items-center gap-1">
              <Link href="/productos" className="whitespace-nowrap transition hover:text-brand">
                Productos
              </Link>
              <button
                type="button"
                onClick={() => setIsProductsOpen((open) => !open)}
                aria-expanded={isProductsOpen}
                aria-haspopup="true"
                aria-label="Mostrar categorías de productos"
                className="flex-shrink-0 text-zinc-400 transition hover:text-brand"
              >
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-150 ${isProductsOpen ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            <div
              role="menu"
              className={`absolute left-0 top-full z-50 mt-2 max-h-[70vh] w-56 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-zinc-100 bg-white py-2 shadow-lg transition duration-150 ease-out ${
                isProductsOpen
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-1 opacity-0 sm:group-hover:visible sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
              }`}
            >
              <Link
                href="/productos"
                role="menuitem"
                onClick={() => setIsProductsOpen(false)}
                className="block whitespace-nowrap px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 hover:text-brand"
              >
                Ver todos los productos
              </Link>

              {categories.length > 0 ? (
                <>
                  <div className="my-1 border-t border-zinc-100" />
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/productos?categoria=${category.slug}`}
                      role="menuitem"
                      onClick={() => setIsProductsOpen(false)}
                      className="block whitespace-nowrap px-4 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50 hover:text-brand"
                    >
                      {category.name}
                    </Link>
                  ))}
                </>
              ) : null}
            </div>
          </div>

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
