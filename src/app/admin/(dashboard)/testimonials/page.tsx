import Link from "next/link";
import TestimonialsTable from "@/components/admin/TestimonialsTable";
import { getTestimonials } from "@/lib/data/testimonials";

export default async function AdminTestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Testimonios</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Gestioná las reseñas de clientes que se muestran en el sitio.
          </p>
        </div>

        <Link
          href="/admin/testimonials/new"
          className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark"
        >
          Nuevo testimonio
        </Link>
      </div>

      {testimonials.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 p-10 text-center text-zinc-400">
          Aún no hay testimonios creados. Creá el primero para comenzar.
        </div>
      ) : (
        <TestimonialsTable testimonials={testimonials} />
      )}
    </div>
  );
}
