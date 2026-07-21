import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/public/AddToCartButton";
import type { Product } from "@/types/database";

type ProductCardProps = {
  product: Product & {
    originalPrice?: number;
    discountedPrice?: number;
    hasDiscount?: boolean;
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  const images = product.images ?? [];
  const primaryImage = images.find((image) => image.is_primary) ?? images[0];
  const originalPrice = product.originalPrice ?? Number(product.price);
  const discountedPrice = product.discountedPrice ?? originalPrice;
  const hasDiscount = product.hasDiscount ?? false;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-sm transition hover:shadow-lg">
      <Link href={`/productos/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square w-full overflow-hidden bg-zinc-800">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={product.name}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">Sin imagen</div>
          )}

          {hasDiscount ? (
            <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Oferta
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col px-3 pt-3 sm:px-4 sm:pt-4">
          {product.category ? (
            <p className="text-xs uppercase tracking-wide text-zinc-400">{product.category.name}</p>
          ) : null}
          <h3 className="mt-1 line-clamp-2 text-sm font-medium text-white sm:text-base">{product.name}</h3>

          <div className="mt-auto flex items-baseline gap-2 pt-2">
            {hasDiscount ? (
              <>
                <span className="text-xs text-zinc-400 line-through">${originalPrice.toFixed(2)}</span>
                <span className="text-lg font-bold text-brand-tint">${discountedPrice.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-brand-tint">${originalPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>

      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
        <AddToCartButton
          id={product.id}
          type="product"
          name={product.name}
          slug={product.slug}
          unitPrice={discountedPrice}
          imageUrl={primaryImage?.url ?? null}
          stock={product.stock}
        />
      </div>
    </div>
  );
}
