import Image from "next/image";
import Link from "next/link";
import FeaturedCombosSection from "@/components/public/FeaturedCombosSection";
import FeaturedProductsSection from "@/components/public/FeaturedProductsSection";
import HeroBackground from "@/components/public/HeroBackground";
import TestimonialsSection from "@/components/public/TestimonialsSection";
import {
  getActivePromotions,
  getBrandsWithProducts,
  getFeaturedCombos,
  getFeaturedProducts,
} from "@/lib/data/public";
import { getActiveTestimonials } from "@/lib/data/testimonials";
import type { ActivePromotion } from "@/lib/data/public";
import type { Brand } from "@/types/database";

export default async function HomePage() {
  const [combos, brands, promotions, products, testimonials] = await Promise.all([
    getFeaturedCombos(6),
    getBrandsWithProducts(),
    getActivePromotions(4),
    getFeaturedProducts(8),
    getActiveTestimonials(8),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden bg-brand text-white">
        <HeroBackground />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">PUNTOFITCBA</h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-zinc-100 sm:text-lg sm:leading-relaxed">
            Todo lo que necesitás para alcanzar tus objetivos. Trabajamos con las principales marcas de
            suplementación deportiva, ofrecemos asesoramiento personalizado y realizamos envíos a todo el país.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/combos"
              className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Ver combos
            </Link>
            <Link
              href="/productos"
              className="rounded-lg border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800"
            >
              Ver catálogo
            </Link>
          </div>
        </div>
      </section>

      <FeaturedCombosSection combos={combos} />

      {brands.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Comprá por marca</h2>
            <p className="mt-1 text-sm text-zinc-400">Encontrá tu marca favorita.</p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:gap-6 sm:overflow-visible lg:grid-cols-6">
            {brands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </section>
      ) : null}

      {promotions.length > 0 ? (
        <section className="bg-zinc-900 py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Promociones activas</h2>
              <p className="mt-1 text-sm text-zinc-400">Descuentos por tiempo limitado.</p>
            </div>

            <div className="space-y-5">
              {promotions.map((promotion) => (
                <PromotionCard key={promotion.id} promotion={promotion} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <FeaturedProductsSection products={products} />

      <TestimonialsSection testimonials={testimonials} />
    </div>
  );
}

function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Link
      href={`/productos?marca=${brand.slug}`}
      className="group flex w-24 flex-shrink-0 flex-col items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-center shadow-sm transition hover:shadow-md sm:w-auto"
    >
      <div className="relative h-14 w-14">
        {brand.logo_url ? (
          <Image src={brand.logo_url} alt={brand.name} fill className="object-contain" />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-zinc-800 text-xs font-semibold text-zinc-400">
            {brand.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <span className="line-clamp-1 text-xs font-medium text-zinc-300">{brand.name}</span>
    </Link>
  );
}

function PromotionCard({ promotion }: { promotion: ActivePromotion }) {
  const discountLabel =
    promotion.discount_type === "percentage"
      ? `${promotion.discount_value ?? 0}% OFF`
      : promotion.discount_type === "fixed_amount"
        ? `$${Number(promotion.discount_value ?? 0).toFixed(2)} OFF`
        : "2x1";

  return (
    <div className="rounded-2xl border border-brand-light bg-zinc-800 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-white">{promotion.name}</h3>
        <span className="rounded-full bg-brand px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
          {discountLabel}
        </span>
      </div>

      {promotion.description ? <p className="mt-1 text-sm text-zinc-400">{promotion.description}</p> : null}

      {promotion.targets.length > 0 ? (
        <div className="mt-4 flex gap-4 overflow-x-auto pb-1">
          {promotion.targets.map((target) => (
            <Link
              key={`${target.type}-${target.id}`}
              href={`/${target.type === "product" ? "productos" : "combos"}/${target.slug}`}
              className="group w-36 flex-shrink-0 rounded-xl border border-zinc-700 bg-zinc-900 p-3 transition hover:shadow-md sm:w-40"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-zinc-800">
                {target.imageUrl ? (
                  <Image
                    src={target.imageUrl}
                    alt={target.name}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-zinc-400">Sin imagen</div>
                )}
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-medium text-zinc-100">{target.name}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xs text-zinc-400 line-through">${target.originalPrice.toFixed(2)}</span>
                <span className="text-sm font-bold text-brand-tint">${target.discountedPrice.toFixed(2)}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
