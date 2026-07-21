import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AddToCartControls from "@/components/public/AddToCartControls";
import ImageGallery from "@/components/public/ImageGallery";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/public";
import type { Product } from "@/types/database";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Producto no encontrado | Punto Fit CBA" };
  }

  return {
    title: `${product.name} | Punto Fit CBA`,
    description: product.description ?? `Comprá ${product.name} en Punto Fit CBA.`,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = product.category_id
    ? await getRelatedProducts(product.category_id, product.id, 4)
    : [];

  const images = (product.images ?? []).map((image) => ({ id: image.id, url: image.url }));
  const primaryImage = (product.images ?? []).find((image) => image.is_primary) ?? product.images?.[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ImageGallery images={images} alt={product.name} />

        <div>
          {product.category ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-tint">{product.category.name}</p>
          ) : null}

          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">{product.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {product.hasDiscount ? (
              <>
                <span className="text-base text-zinc-400 line-through">${product.originalPrice.toFixed(2)}</span>
                <span className="text-3xl font-bold text-brand-tint">${product.discountedPrice.toFixed(2)}</span>
                <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  Oferta
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-brand-tint">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          <p className="mt-2 text-sm text-zinc-400">
            {product.stock > 0 ? `${product.stock} unidades disponibles` : "Sin stock"}
          </p>

          {product.description ? (
            <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-zinc-300">{product.description}</p>
          ) : null}

          <div className="mt-8">
            <AddToCartControls
              id={product.id}
              type="product"
              name={product.name}
              slug={product.slug}
              unitPrice={product.discountedPrice}
              imageUrl={primaryImage?.url ?? null}
              stock={product.stock}
            />
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 ? (
        <section className="mt-14">
          <h2 className="text-xl font-bold text-white sm:text-2xl">Productos relacionados</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {relatedProducts.map((related) => (
              <RelatedProductCard key={related.id} product={related} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function RelatedProductCard({ product }: { product: Product }) {
  const images = product.images ?? [];
  const primaryImage = images.find((image) => image.is_primary) ?? images[0];

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-sm transition hover:shadow-lg"
    >
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
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-medium text-white sm:text-base">{product.name}</h3>
        <p className="mt-2 text-lg font-bold text-brand-tint">${Number(product.price).toFixed(2)}</p>
      </div>
    </Link>
  );
}
