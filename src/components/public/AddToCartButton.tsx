"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useCart, type CartItemType } from "@/context/CartContext";

type AddToCartButtonProps = {
  id: string;
  type: CartItemType;
  name: string;
  slug: string;
  unitPrice: number;
  imageUrl: string | null;
  stock?: number | null;
};

export default function AddToCartButton({ id, type, name, slug, unitPrice, imageUrl, stock = null }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const isOutOfStock = stock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      return;
    }

    addItem({ id, type, name, slug, unitPrice, imageUrl, stock, quantity: 1 });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  if (isOutOfStock) {
    return (
      <button
        type="button"
        disabled
        className="mt-3 flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-500 sm:text-sm"
      >
        Sin stock
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-dark sm:text-sm"
    >
      {justAdded ? <Check size={16} /> : <ShoppingCart size={16} />}
      {justAdded ? "¡Agregado!" : "Agregar al carrito"}
    </button>
  );
}
