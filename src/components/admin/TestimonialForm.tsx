"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createTestimonial, updateTestimonial } from "@/lib/actions/testimonials";
import type { Testimonial } from "@/types/database";

const initialErrors = {
  customer_name: "",
  review_text: "",
};

type TestimonialFormProps = {
  testimonial?: Testimonial | null;
  mode?: "create" | "edit";
};

export default function TestimonialForm({ testimonial, mode = "create" }: TestimonialFormProps) {
  const router = useRouter();
  const isEditMode = mode === "edit";

  const [customerName, setCustomerName] = useState(testimonial?.customer_name ?? "");
  const [reviewText, setReviewText] = useState(testimonial?.review_text ?? "");
  const [displayOrder, setDisplayOrder] = useState(testimonial?.display_order?.toString() ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState(initialErrors);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const validate = () => {
    const nextErrors = {
      customer_name: customerName.trim() ? "" : "El nombre del cliente es obligatorio.",
      review_text: reviewText.trim() ? "" : "La reseña es obligatoria.",
    };

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const formData = new FormData();

      if (isEditMode && testimonial?.id) {
        formData.set("testimonial_id", testimonial.id);
      }

      formData.set("customer_name", customerName);
      formData.set("review_text", reviewText);
      formData.set("display_order", displayOrder);

      if (photoFile) {
        formData.append("photo", photoFile);
      }

      if (isEditMode) {
        await updateTestimonial(formData);
      } else {
        await createTestimonial(formData);
      }

      router.push("/admin/testimonials");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar el testimonio.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">{isEditMode ? "Editar testimonio" : "Nuevo testimonio"}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {isEditMode ? "Actualizá los datos del testimonio." : "Sumá una reseña de un cliente para mostrar en el sitio."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-200" htmlFor="customer_name">
            Nombre del cliente
          </label>
          <input
            id="customer_name"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
            required
          />
          {errors.customer_name ? <p className="mt-1 text-sm text-red-400">{errors.customer_name}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-200" htmlFor="review_text">
            Reseña
          </label>
          <textarea
            id="review_text"
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            rows={4}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
            required
          />
          {errors.review_text ? <p className="mt-1 text-sm text-red-400">{errors.review_text}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-200" htmlFor="display_order">
            Orden de aparición <span className="text-zinc-500">(opcional)</span>
          </label>
          <input
            id="display_order"
            type="number"
            step="1"
            value={displayOrder}
            onChange={(event) => setDisplayOrder(event.target.value)}
            placeholder="Se agrega al final si lo dejás vacío"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600"
          />
          <p className="mt-1 text-xs text-zinc-500">Los testimonios se muestran de menor a mayor orden.</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-200" htmlFor="photo">
            Foto del cliente <span className="text-zinc-500">(opcional)</span>
          </label>
          <input
            id="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoSelection}
            className="block w-full rounded-lg border border-dashed border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-300"
          />

          {previewUrl ? (
            <div className="mt-4">
              <img src={previewUrl} alt="preview foto" className="h-20 w-20 rounded-full border border-zinc-800 object-cover" />
            </div>
          ) : isEditMode && testimonial?.photo_url ? (
            <div className="mt-4">
              <img
                src={testimonial.photo_url}
                alt="foto actual"
                className="h-20 w-20 rounded-full border border-zinc-800 object-cover"
              />
            </div>
          ) : null}
        </div>

        {message ? <p className="text-sm text-red-400">{message}</p> : null}

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Guardando..." : isEditMode ? "Actualizar testimonio" : "Guardar testimonio"}
          </button>
        </div>
      </form>
    </div>
  );
}
