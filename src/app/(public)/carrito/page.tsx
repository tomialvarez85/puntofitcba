"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const router = useRouter();
  const { items, totalPrice, updateQuantity, removeItem, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [nameError, setNameError] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (!hasSubmitted && items.length === 0) {
      router.replace("/productos?carrito=vacio");
    }
  }, [hasSubmitted, items.length, router]);

  if (hasSubmitted) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center sm:px-6">
        <ShoppingBag size={48} className="text-brand-tint" />
        <h1 className="mt-4 text-2xl font-bold text-white">¡Listo! Te llevamos a WhatsApp</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Confirmá el envío del mensaje para cerrar tu pedido con Punto Fit CBA.
        </p>
        <Link
          href="/productos"
          className="mt-6 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Seguir comprando
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  const handleConfirm = () => {
    if (!customerName.trim()) {
      setNameError("Ingresá tu nombre para continuar.");
      return;
    }

    setNameError("");

    const lines = items.map((item) => {
      const subtotal = item.unitPrice * item.quantity;
      return `${item.quantity}x ${item.name} - $${item.unitPrice.toFixed(2)} c/u = $${subtotal.toFixed(2)}`;
    });

    const messageParts = [
      "🛒 *Nuevo pedido - Punto Fit CBA*",
      "",
      ...lines,
      "",
      `*Total: $${totalPrice.toFixed(2)}*`,
      "",
      `Cliente: ${customerName.trim()}`,
    ];

    if (customerPhone.trim()) {
      messageParts.push(`Teléfono: ${customerPhone.trim()}`);
    }

    if (notes.trim()) {
      messageParts.push(`Notas: ${notes.trim()}`);
    }

    const message = messageParts.join("\n");
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
    const waLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(waLink, "_blank");
    clearCart();
    setHasSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-2xl font-bold text-white sm:text-3xl">Tu pedido</h1>
      <p className="mt-1 text-sm text-zinc-400">Revisá los productos antes de confirmar tu pedido por WhatsApp.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div key={`${item.type}-${item.id}`} className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-zinc-400">Sin imagen</div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{item.name}</p>
                  <p className="mt-1 text-sm font-semibold text-brand-tint">${item.unitPrice.toFixed(2)} c/u</p>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-zinc-700">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.type, item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="flex h-8 w-8 items-center justify-center text-zinc-300 disabled:opacity-30"
                      aria-label="Restar cantidad"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-white">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.type, item.id, item.quantity + 1)}
                      disabled={typeof item.stock === "number" && item.quantity >= item.stock}
                      className="flex h-8 w-8 items-center justify-center text-zinc-300 disabled:opacity-30"
                      aria-label="Sumar cantidad"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-white">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
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
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900 p-5 lg:sticky lg:top-24">
          <div className="flex items-center justify-between text-base font-semibold text-white">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="customerName" className="mb-1 block text-sm font-medium text-zinc-300">
                Nombre
              </label>
              <input
                id="customerName"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Tu nombre"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-brand-tint"
              />
              {nameError ? <p className="mt-1 text-xs text-red-500">{nameError}</p> : null}
            </div>

            <div>
              <label htmlFor="customerPhone" className="mb-1 block text-sm font-medium text-zinc-300">
                Teléfono <span className="text-zinc-500">(opcional)</span>
              </label>
              <input
                id="customerPhone"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                placeholder="Ej: 351 000-0000"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-brand-tint"
              />
            </div>

            <div>
              <label htmlFor="notes" className="mb-1 block text-sm font-medium text-zinc-300">
                Notas <span className="text-zinc-500">(opcional)</span>
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="Ej: sin sabor a chocolate, entregar después de las 18hs"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-brand-tint"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Confirmar pedido por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
