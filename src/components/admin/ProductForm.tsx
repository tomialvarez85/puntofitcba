"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/lib/actions/products";
import type { Brand, Category, Product, ProductImage } from "@/types/database";

const initialErrors = {
  name: "",
  slug: "",
  price: "",
  stock: "",
};

type ProductFormProps = {
  initialCategories: Category[];
  initialBrands: Brand[];
  product?: Product | null;
  mode?: "create" | "edit";
};

export default function ProductForm({ initialCategories, initialBrands, product, mode = "create" }: ProductFormProps) {
  const router = useRouter();
  const isEditMode = mode === "edit";

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [stock, setStock] = useState(product?.stock?.toString() ?? "0");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [brandId, setBrandId] = useState(product?.brand_id ?? "");
  const [active, setActive] = useState(product?.active ?? true);
  const [categories] = useState<Category[]>(initialCategories);
  const [brands] = useState<Brand[]>(initialBrands);
  const [existingImages, setExistingImages] = useState<ProductImage[]>(product?.images ?? []);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [primaryImageId, setPrimaryImageId] = useState<string | null>(
    product?.images?.find((image) => image.is_primary)?.id ?? null,
  );
  const [errors, setErrors] = useState(initialErrors);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);

    if (!isEditMode || !slug.trim()) {
      setSlug(slugify(value));
    }
  };

  const handleImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const validFiles = files.filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type));
    setNewImages(validFiles);
    setNewPreviews(validFiles.map((file) => URL.createObjectURL(file)));

    if (validFiles.length > 0 && !primaryImageId) {
      setPrimaryImageId(`new:0`);
    }
  };

  const handleDeleteExistingImage = (imageId: string) => {
    if (!window.confirm("¿Eliminar esta imagen?")) {
      return;
    }

    const remaining = existingImages.filter((image) => image.id !== imageId);
    setExistingImages(remaining);
    setImagesToDelete((current) => (current.includes(imageId) ? current : [...current, imageId]));

    if (primaryImageId === imageId) {
      setPrimaryImageId(remaining[0]?.id ?? (newImages.length > 0 ? "new:0" : null));
    }
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
      if (isEditMode && product?.id) {
        formData.set("product_id", product.id);
      }

      formData.set("name", name);
      formData.set("slug", slug);
      formData.set("description", description);
      formData.set("price", price);
      formData.set("stock", stock);
      formData.set("category_id", categoryId);
      formData.set("brand_id", brandId);
      formData.set("active", active ? "on" : "off");

      if (isEditMode) {
        imagesToDelete.forEach((imageId) => formData.append("delete_image_ids", imageId));
      }

      newImages.forEach((file) => {
        formData.append("images", file);
      });

      if (primaryImageId) {
        formData.set("primary_image_id", primaryImageId);
      }

      if (newImages.length > 0 && primaryImageId === null) {
        formData.set("primary_image_index", "0");
      }

      if (isEditMode) {
        await updateProduct(formData);
      } else {
        await createProduct(formData);
      }

      router.push("/admin/products");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar el producto.");
    } finally {
      setSubmitting(false);
    }
  };

  const priceValue = useMemo(() => Number(price || 0), [price]);
  const stockValue = useMemo(() => Number(stock || 0), [stock]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">{isEditMode ? "Editar producto" : "Nuevo producto"}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {isEditMode
            ? "Actualizá los datos del producto, sus imágenes y la imagen principal."
            : "Completa los datos del producto y súbele imágenes para publicarlo."}
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

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-200" htmlFor="brand_id">
              Marca
            </label>
            <select
              id="brand_id"
              value={brandId}
              onChange={(event) => setBrandId(event.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="">Sin marca</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
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

        {isEditMode && existingImages.length > 0 ? (
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-200">Imágenes actuales</label>
            <div className="grid gap-3 sm:grid-cols-2">
              {existingImages.map((image) => (
                <div key={image.id} className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-3">
                  <img src={image.url} alt={image.id} className="h-32 w-full rounded-lg object-cover" />
                  <div className="mt-3 flex items-center justify-between gap-2 text-sm">
                    <label className="flex items-center gap-2 text-zinc-200">
                      <input
                        type="radio"
                        name="primary-image"
                        checked={primaryImageId === image.id}
                        onChange={() => setPrimaryImageId(image.id)}
                      />
                      Principal
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingImage(image.id)}
                      className="rounded-md border border-red-700/40 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-950/40"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-200" htmlFor="images">
            Agregar imágenes (jpg, png, webp)
          </label>
          <input
            id="images"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImageSelection}
            className="block w-full rounded-lg border border-dashed border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-300"
          />

          {newPreviews.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {newPreviews.map((preview, index) => (
                <div key={preview} className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-3">
                  <img src={preview} alt={`preview-${index}`} className="h-32 w-full rounded-lg object-cover" />
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-zinc-400">{newImages[index]?.name ?? `Imagen ${index + 1}`}</span>
                    <label className="flex items-center gap-2 text-zinc-200">
                      <input
                        type="radio"
                        name="primary-image"
                        checked={primaryImageId === `new:${index}`}
                        onChange={() => setPrimaryImageId(`new:${index}`)}
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
            Precio: ${priceValue.toFixed(2)} · Stock: {stockValue}
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Guardando..." : isEditMode ? "Actualizar producto" : "Guardar producto"}
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
