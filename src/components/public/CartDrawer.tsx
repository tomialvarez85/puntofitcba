"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils/format";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalPrice } = useCart();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={closeCart}>
      <div
        className="flex h-full w-full max-w-sm flex-col bg-zinc-900 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">Tu carrito</h2>
          <button type="button" onClick={closeCart} aria-label="Cerrar carrito">
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag size={40} className="text-zinc-600" />
            <p className="text-sm text-zinc-400">Tu carrito está vacío. ¡Agregá productos o combos para empezar!</p>
            <Link
              href="/productos"
              onClick={closeCart}
              className="mt-2 rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {items.map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex gap-3 border-b border-zinc-800 pb-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-zinc-400">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-1">
                    <p className="line-clamp-2 text-sm font-medium text-white">{item.name}</p>
                    <p className="text-sm font-semibold text-brand-tint">{formatPrice(item.unitPrice)}</p>

                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-zinc-700">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.type, item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="flex h-7 w-7 items-center justify-center text-zinc-300 disabled:opacity-30"
                          aria-label="Restar cantidad"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold text-white">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.type, item.id, item.quantity + 1)}
                          disabled={typeof item.stock === "number" && item.quantity >= item.stock}
                          className="flex h-7 w-7 items-center justify-center text-zinc-300 disabled:opacity-30"
                          aria-label="Sumar cantidad"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.type, item.id)}
                        aria-label="Eliminar del carrito"
                        className="text-zinc-500 transition hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-800 px-5 py-4">
              <div className="mb-4 flex items-center justify-between text-base font-semibold text-white">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <Link
                href="/carrito"
                onClick={closeCart}
                className="flex w-full items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                Finalizar pedido
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
