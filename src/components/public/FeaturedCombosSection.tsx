"use client";

import Link from "next/link";
import ComboCard from "@/components/public/ComboCard";
import HorizontalSlider from "@/components/public/HorizontalSlider";
import type { ComboWithItems } from "@/types/database";

type FeaturedCombo = ComboWithItems & {
  originalPrice?: number;
  discountedPrice?: number;
  hasDiscount?: boolean;
};

type FeaturedCombosSectionProps = {
  combos: FeaturedCombo[];
};

export default function FeaturedCombosSection({ combos }: FeaturedCombosSectionProps) {
  if (combos.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Combos</h2>
            <p className="mt-1 text-sm text-zinc-500">Ahorrá más llevando el pack completo.</p>
          </div>
          <Link href="/combos" className="hidden text-sm font-semibold text-brand hover:text-brand sm:block">
            Ver todos →
          </Link>
        </div>
      </div>

      <HorizontalSlider
        items={combos}
        getKey={(combo) => combo.id}
        renderItem={(combo) => <ComboCard combo={combo} showComboBadge />}
        gridClassName="md:grid-cols-2 lg:grid-cols-3"
      />
    </section>
  );
}
