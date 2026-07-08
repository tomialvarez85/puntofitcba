"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import type { Category } from "@/types/database";

const initialErrors = {
  name: "",
  slug: "",
};

type CategoryFormProps = {
  category?: Category | null;
  mode?: "create" | "edit";
};

export default function CategoryForm({ category, mode = "create" }: CategoryFormProps) {
  const router = useRouter();
  const isEditMode = mode === "edit";

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [errors, setErrors] = useState(initialErrors);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);

    if (!isEditMode || !slug.trim()) {
      setSlug(slugify(value));
    }
  };

  const validate = () => {
    const nextErrors = {
      name: name.trim() ? "" : "El nombre es obligatorio.",
      slug: slug.trim() ? "" : "El slug es obligatorio.",
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

      if (isEditMode && category?.id) {
        formData.set("category_id", category.id);
      }

      formData.set("name", name);
      formData.set("slug", slug);

      if (isEditMode) {
        await updateCategory(formData);
      } else {
        await createCategory(formData);
      }

      router.push("/admin/categories");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar la categoría.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">{isEditMode ? "Editar categoría" : "Nueva categoría"}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {isEditMode
            ? "Actualizá el nombre o el slug de la categoría."
            : "Creá una categoría para organizar tus productos."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-200" htmlFor="name">
            Nombre
          </label>
          <input
            id="name"
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
            required
          />
          {errors.name ? <p className="mt-1 text-sm text-red-400">{errors.name}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-200" htmlFor="slug">
            Slug
          </label>
          <div className="flex gap-2">
            <input
              id="slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setSlug(slugify(name))}
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300"
            >
              Generar
            </button>
          </div>
          {errors.slug ? <p className="mt-1 text-sm text-red-400">{errors.slug}</p> : null}
        </div>

        {message ? <p className="text-sm text-red-400">{message}</p> : null}

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Guardando..." : isEditMode ? "Actualizar categoría" : "Guardar categoría"}
          </button>
        </div>
      </form>
    </div>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
