"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { deleteTestimonial, toggleTestimonialActive } from "@/lib/actions/testimonials";
import type { Testimonial } from "@/types/database";

type TestimonialsTableProps = {
  testimonials: Testimonial[];
};

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}…`;
}

export default function TestimonialsTable({ testimonials }: TestimonialsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!selectedTestimonial) {
      return;
    }

    setError(null);

    try {
      await deleteTestimonial(selectedTestimonial.id);
      setSelectedTestimonial(null);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el testimonio.");
    }
  };

  const handleToggle = async (testimonial: Testimonial) => {
    setError(null);

    try {
      await toggleTestimonialActive(testimonial.id, !testimonial.active);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el estado del testimonio.");
    }
  };

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-xl border border-red-700/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-800 text-sm">
            <thead className="bg-zinc-950/70 text-left text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Reseña</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {testimonials.map((testimonial) => (
                <tr key={testimonial.id} className="hover:bg-zinc-800/70">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {testimonial.photo_url ? (
                        <img
                          src={testimonial.photo_url}
                          alt={testimonial.customer_name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-400">
                          {testimonial.customer_name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <p className="font-medium text-white">{testimonial.customer_name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 max-w-xs text-zinc-300">{truncate(testimonial.review_text, 80)}</td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => void handleToggle(testimonial)}
                      disabled={isPending}
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium transition ${
                        testimonial.active
                          ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                          : "bg-zinc-700/70 text-zinc-300 hover:bg-zinc-600"
                      } ${isPending ? "cursor-not-allowed opacity-70" : ""}`}
                    >
                      {testimonial.active ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/testimonials/${testimonial.id}/edit`}
                        className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => setSelectedTestimonial(testimonial)}
                        disabled={isPending}
                        className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(selectedTestimonial)}
        title="Eliminar testimonio"
        description={`¿Estás seguro que querés eliminar la reseña de ${selectedTestimonial?.customer_name ?? "este cliente"}?`}
        confirmLabel="Eliminar"
        isPending={isPending}
        onConfirm={() => void handleDelete()}
        onCancel={() => setSelectedTestimonial(null)}
      />
    </div>
  );
}
