"use client";

import Image from "next/image";
import { Quote, User } from "lucide-react";
import HorizontalSlider from "@/components/public/HorizontalSlider";
import type { Testimonial } from "@/types/database";

type TestimonialsSectionProps = {
  testimonials: Testimonial[];
};

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="bg-zinc-50 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Qué dicen de nosotros</h2>
          <p className="mt-1 text-sm text-zinc-500">La opinión de quienes ya confiaron en nosotros.</p>
        </div>
      </div>

      <HorizontalSlider
        items={testimonials}
        getKey={(testimonial) => testimonial.id}
        renderItem={(testimonial) => <TestimonialCard testimonial={testimonial} />}
        gridClassName="md:grid-cols-3 lg:grid-cols-4"
      />
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <Quote size={28} className="text-brand-light" aria-hidden="true" />
      <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-600">{testimonial.review_text}</p>
      <div className="mt-5 flex items-center gap-3">
        {testimonial.photo_url ? (
          <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-full">
            <Image src={testimonial.photo_url} alt={testimonial.customer_name} fill className="object-cover" />
          </div>
        ) : (
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
            <User size={20} />
          </div>
        )}
        <p className="text-sm font-semibold text-zinc-900">{testimonial.customer_name}</p>
      </div>
    </div>
  );
}
