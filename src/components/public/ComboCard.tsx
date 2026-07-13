import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/public/AddToCartButton";
import type { ComboWithItems } from "@/types/database";

type ComboCardProps = {
  combo: ComboWithItems & {
    originalPrice?: number;
    discountedPrice?: number;
    hasDiscount?: boolean;
  };
  showComboBadge?: boolean;
};

export default function ComboCard({ combo, showComboBadge = false }: ComboCardProps) {
  const items = combo.items ?? [];
  const originalPrice = combo.originalPrice ?? Number(combo.price);
  const discountedPrice = combo.discountedPrice ?? originalPrice;
  const hasDiscount = combo.hasDiscount ?? false;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-lg">
      <Link href={`/combos/${combo.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
          {combo.image_url ? (
            <Image
              src={combo.image_url}
              alt={combo.name}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">Sin imagen</div>
          )}

          {hasDiscount ? (
            <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Oferta
            </span>
          ) : showComboBadge ? (
            <span className="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              Combo
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col px-4 pt-4 sm:px-5 sm:pt-5">
          <h3 className="line-clamp-2 text-lg font-semibold text-zinc-900">{combo.name}</h3>

          {items.length > 0 ? (
            <ul className="mt-2 space-y-0.5 text-sm text-zinc-500">
              {items.slice(0, 3).map((item) => (
                <li key={item.id} className="truncate">
                  {item.quantity > 1 ? `${item.quantity}x ` : ""}
                  {item.product?.name ?? "Producto"}
                </li>
              ))}
              {items.length > 3 ? <li className="text-zinc-400">+{items.length - 3} más</li> : null}
            </ul>
          ) : null}

          <div className="mt-auto flex items-baseline gap-2 pt-3">
            {hasDiscount ? (
              <>
                <span className="text-sm text-zinc-400 line-through">${originalPrice.toFixed(2)}</span>
                <span className="text-2xl font-bold text-brand">${discountedPrice.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-2xl font-bold text-brand">${originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <AddToCartButton
          id={combo.id}
          type="combo"
          name={combo.name}
          slug={combo.slug}
          unitPrice={discountedPrice}
          imageUrl={combo.image_url}
        />
      </div>
    </div>
  );
}
