"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createBrand, updateBrand } from "@/lib/actions/brands";
import type { Brand } from "@/types/database";

const initialErrors = {
  name: "",
  slug: "",
};

type BrandFormProps = {
  brand?: Brand | null;
  mode?: "create" | "edit";
};

export default function BrandForm({ brand, mode = "create" }: BrandFormProps) {
  const router = useRouter();
  const isEditMode = mode === "edit";

  const [name, setName] = useState(brand?.name ?? "");
  const [slug, setSlug] = useState(brand?.slug ?? "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState(initialErrors);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);

    if (!isEditMode || !slug.trim()) {
      setSlug(slugify(value));
    }
  };

  const handleLogoSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setLogoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
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

      if (isEditMode && brand?.id) {
        formData.set("brand_id", brand.id);
      }

      formData.set("name", name);
      formData.set("slug", slug);

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      if (isEditMode) {
        await updateBrand(formData);
      } else {
        await createBrand(formData);
      }

      router.push("/admin/brands");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar la marca.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">{isEditMode ? "Editar marca" : "Nueva marca"}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {isEditMode ? "Actualizá los datos de la marca." : "Creá una marca para organizar tus productos."}
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

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-200" htmlFor="logo">
            Logo de la marca
          </label>
          <input
            id="logo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleLogoSelection}
            className="block w-full rounded-lg border border-dashed border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-300"
          />

          {previewUrl ? (
            <div className="mt-4 w-32 rounded-xl border border-zinc-800 bg-zinc-950/80 p-3">
              <img src={previewUrl} alt="preview logo" className="h-20 w-full rounded-lg object-contain" />
            </div>
          ) : null}

          {isEditMode && !previewUrl && brand?.logo_url ? (
            <div className="mt-4 w-32 rounded-xl border border-zinc-800 bg-zinc-950/80 p-3">
              <img src={brand.logo_url} alt="logo actual" className="h-20 w-full rounded-lg object-contain" />
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
            {submitting ? "Guardando..." : isEditMode ? "Actualizar marca" : "Guardar marca"}
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
