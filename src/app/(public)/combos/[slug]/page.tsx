import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AddToCartControls from "@/components/public/AddToCartControls";
import ImageGallery from "@/components/public/ImageGallery";
import { getComboBySlug } from "@/lib/data/public";
import { formatPrice } from "@/lib/utils/format";

type ComboDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ComboDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const combo = await getComboBySlug(slug);

  if (!combo) {
    return { title: "Combo no encontrado | Punto Fit CBA" };
  }

  return {
    title: `${combo.name} | Punto Fit CBA`,
    description: combo.description ?? `Comprá el combo ${combo.name} en Punto Fit CBA.`,
  };
}

export default async function ComboDetailPage({ params }: ComboDetailPageProps) {
  const { slug } = await params;
  const combo = await getComboBySlug(slug);

  if (!combo) {
    notFound();
  }

  const items = combo.items ?? [];
  const images = combo.image_url ? [{ id: combo.id, url: combo.image_url }] : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ImageGallery images={images} alt={combo.name} />

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-tint">Combo</p>
          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">{combo.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {combo.hasDiscount ? (
              <>
                <span className="text-base text-zinc-400 line-through">{formatPrice(combo.originalPrice)}</span>
                <span className="text-3xl font-bold text-brand-tint">{formatPrice(combo.discountedPrice)}</span>
                <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  Oferta
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-brand-tint">{formatPrice(combo.originalPrice)}</span>
            )}
          </div>

          {combo.description ? (
            <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-zinc-300">{combo.description}</p>
          ) : null}

          {items.length > 0 ? (
            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Incluye</h2>
              <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                {items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}x {item.product?.name ?? "Producto"}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-8">
            <AddToCartControls
              id={combo.id}
              type="combo"
              name={combo.name}
              slug={combo.slug}
              unitPrice={combo.discountedPrice}
              imageUrl={combo.image_url}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
