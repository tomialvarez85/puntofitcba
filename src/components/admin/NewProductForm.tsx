"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/lib/actions/products";
import { formatPrice } from "@/lib/utils/format";
import type { Category } from "@/types/database";

const initialErrors = {
  name: "",
  slug: "",
  price: "",
  stock: "",
};

type NewProductFormProps = {
  initialCategories: Category[];
};

export default function NewProductForm({ initialCategories }: NewProductFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  const [active, setActive] = useState(true);
  const [categories] = useState<Category[]>(initialCategories);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [errors, setErrors] = useState(initialErrors);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!name.trim()) {
      setSlug("");
      return;
    }

    const generated = slugify(name);
    setSlug(generated);
  }, [name]);

  const handleImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const validFiles = files.filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type));
    setImages(validFiles);
    setPrimaryImageIndex(0);

    const nextPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviews(nextPreviews);
  };

  const validate = () => {
    const nextErrors = {
      name: name.trim() ? "" : "El nombre es obligatorio.",
      slug: slug.trim() ? "" : "El slug es obligatorio.",
      price: Number(price) >= 0 ? "" : "El precio no puede ser negativo.",
      stock: Number(stock) >= 0 ? "" : "El stock no puede ser negativo.",
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
      formData.set("name", name);
      formData.set("slug", slug);
      formData.set("description", description);
      formData.set("price", price);
      formData.set("stock", stock);
      formData.set("category_id", categoryId);
      formData.set("active", active ? "on" : "off");
      images.forEach((file, index) => {
        formData.append("images", file);
        formData.append(`image_primary_${index}`, index === primaryImageIndex ? "1" : "0");
      });

      await createProduct(formData);
      router.push("/admin/products");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo crear el producto.");
    } finally {
      setSubmitting(false);
    }
  };

  const priceValue = useMemo(() => Number(price || 0), [price]);
  const stockValue = useMemo(() => Number(stock || 0), [stock]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">Nuevo producto</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Completa los datos del producto y súbele imágenes para publicarlo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-200" htmlFor="name">
              Nombre
            </label>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
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
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-200" htmlFor="description">
            Descripción
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-200" htmlFor="price">
              Precio
            </label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
              required
            />
            {errors.price ? <p className="mt-1 text-sm text-red-400">{errors.price}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-200" htmlFor="stock">
              Stock
            </label>
            <input
              id="stock"
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
              required
            />
            {errors.stock ? <p className="mt-1 text-sm text-red-400">{errors.stock}</p> : null}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-200" htmlFor="category_id">
              Categoría
            </label>
            <select
              id="category_id"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="">Sin categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-200">
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-900"
            />
            Producto activo
          </label>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-200" htmlFor="images">
            Imágenes (jpg, png, webp)
          </label>
          <input
            id="images"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImageSelection}
            className="block w-full rounded-lg border border-dashed border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-300"
          />

          {previews.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {previews.map((preview, index) => (
                <div key={preview} className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-3">
                  <img src={preview} alt={`preview-${index}`} className="h-32 w-full rounded-lg object-cover" />
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-zinc-400">{images[index]?.name ?? `Imagen ${index + 1}`}</span>
                    <label className="flex items-center gap-2 text-zinc-200">
                      <input
                        type="radio"
                        name="primary-image"
                        checked={index === primaryImageIndex}
                        onChange={() => setPrimaryImageIndex(index)}
                      />
                      Principal
                    </label>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {message ? <p className="text-sm text-red-400">{message}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-400">
            Precio: {formatPrice(priceValue)} · Stock: {stockValue}
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Guardando..." : "Guardar producto"}
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
