"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart, type CartItemType } from "@/context/CartContext";

type AddToCartControlsProps = {
  id: string;
  type: CartItemType;
  name: string;
  slug: string;
  unitPrice: number;
  imageUrl: string | null;
  stock?: number | null;
};

export default function AddToCartControls({ id, type, name, slug, unitPrice, imageUrl, stock = null }: AddToCartControlsProps) {
  const { addItem } = useCart();
  const isOutOfStock = stock === 0;
  const maxQuantity = stock && stock > 0 ? stock : 99;
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const decrease = () => setQuantity((current) => Math.max(1, current - 1));
  const increase = () => setQuantity((current) => Math.min(maxQuantity, current + 1));

  const handleAddToCart = () => {
    addItem({ id, type, name, slug, unitPrice, imageUrl, stock, quantity });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  if (isOutOfStock) {
    return (
      <div className="space-y-3">
        <span className="inline-block rounded-lg bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-400">
          Sin stock
        </span>
        <button
          type="button"
          disabled
          className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-zinc-800 px-6 py-3 text-sm font-semibold text-zinc-500 sm:w-auto"
        >
          <ShoppingCart size={18} />
          Sin stock
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-zinc-300">Cantidad</span>
        <div className="flex items-center rounded-lg border border-zinc-700">
          <button
            type="button"
            onClick={decrease}
            disabled={quantity <= 1}
            aria-label="Restar cantidad"
            className="flex h-10 w-10 items-center justify-center text-zinc-300 transition disabled:opacity-30"
          >
            <Minus size={16} />
          </button>
          <span className="w-10 text-center text-sm font-semibold text-white">{quantity}</span>
          <button
            type="button"
            onClick={increase}
            disabled={quantity >= maxQuantity}
            aria-label="Sumar cantidad"
            className="flex h-10 w-10 items-center justify-center text-zinc-300 transition disabled:opacity-30"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark sm:w-auto"
      >
        {justAdded ? <Check size={18} /> : <ShoppingCart size={18} />}
        {justAdded ? "Agregado" : "Agregar al carrito"}
      </button>
    </div>
  );
}
