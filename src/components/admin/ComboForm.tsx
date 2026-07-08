"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createCombo, updateCombo } from "@/lib/actions/combos";
import type { ComboWithItems, Product } from "@/types/database";

type ComboFormProps = {
  initialProducts: Product[];
  mode?: "create" | "edit";
  combo?: ComboWithItems | null;
};

type ComboItemDraft = {
  productId: string;
  quantity: number;
};

const initialErrors = {
  name: "",
  slug: "",
  price: "",
};

export default function ComboForm({ initialProducts, mode = "create", combo }: ComboFormProps) {
  const router = useRouter();
  const isEditMode = mode === "edit";
  const [name, setName] = useState(combo?.name ?? "");
  const [slug, setSlug] = useState(combo?.slug ?? "");
  const [description, setDescription] = useState(combo?.description ?? "");
  const [price, setPrice] = useState(combo?.price?.toString() ?? "");
  const [active, setActive] = useState(combo?.active ?? true);
  const [items, setItems] = useState<ComboItemDraft[]>(() => {
    if (!combo?.items) {
      return [];
    }

    return combo.items
      .filter((item) => item.product_id)
      .map((item) => ({ productId: item.product_id, quantity: item.quantity }));
  });
  const [products] = useState<Product[]>(initialProducts);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(combo?.image_url ?? null);
  const [slugTouched, setSlugTouched] = useState(Boolean(combo?.slug));
  const [errors, setErrors] = useState(initialErrors);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!slugTouched && name.trim()) {
      setSlug(slugify(name));
    }
  }, [name, slugTouched]);

  const addItem = () => {
    setItems((current) => [...current, { productId: products[0]?.id ?? "", quantity: 1 }]);
  };

  const updateItem = (index: number, patch: Partial<ComboItemDraft>) => {
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  const removeItem = (index: number) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const validate = () => {
    const nextErrors = {
      name: name.trim() ? "" : "El nombre es obligatorio.",
      slug: slug.trim() ? "" : "El slug es obligatorio.",
      price: Number(price) >= 0 ? "" : "El precio no puede ser negativo.",
    };

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean) && items.length > 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      setMessage("Agregá al menos un producto al combo antes de guardar.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const formData = new FormData();
      if (isEditMode && combo?.id) {
        formData.set("combo_id", combo.id);
      }

      formData.set("name", name);
      formData.set("slug", slug);
      formData.set("description", description);
      formData.set("price", price);
      formData.set("active", active ? "on" : "off");

      items.forEach((item) => {
        formData.append("item_product_ids", item.productId);
        formData.append("item_quantities", String(item.quantity));
      });

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (isEditMode) {
        await updateCombo(formData);
      } else {
        await createCombo(formData);
      }
      router.push("/admin/combos");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar el combo.");
    } finally {
      setSubmitting(false);
    }
  };

  const priceValue = useMemo(() => Number(price || 0), [price]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">{isEditMode ? "Editar combo" : "Nuevo combo"}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {isEditMode
            ? "Actualizá los productos, el precio y la imagen del combo."
            : "Armá un combo con productos seleccionados y una imagen visible para el catálogo."}
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
            <input
              id="slug"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setSlugTouched(true);
              }}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
              required
            />
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
              Precio del combo
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

          <label className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-200">
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-900"
            />
            Combo activo
          </label>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Productos incluidos</h2>
              <p className="text-sm text-zinc-400">Agregá al menos un producto para guardar el combo.</p>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
            >
              + Agregar producto
            </button>
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-700 p-6 text-center text-sm text-zinc-400">
              Todavía no agregaste productos al combo.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => {
                const selectedProduct = products.find((product) => product.id === item.productId);
                return (
                  <div key={`${item.productId}-${index}`} className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 md:flex-row md:items-center">
                    <select
                      value={item.productId}
                      onChange={(event) => updateItem(index, { productId: event.target.value })}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none md:max-w-xs"
                    >
                      <option value="">Seleccionar producto</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) => updateItem(index, { quantity: Number(event.target.value) })}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none md:max-w-[120px]"
                    />

                    <div className="text-sm text-zinc-400">
                      {selectedProduct ? `${selectedProduct.name}` : "Producto sin seleccionar"}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="rounded-lg border border-red-800/40 px-3 py-2 text-sm text-red-300 transition hover:bg-red-950/40"
                    >
                      Quitar
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-200" htmlFor="image">
            Imagen del combo
          </label>
          <input
            id="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageSelection}
            className="block w-full rounded-lg border border-dashed border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-300"
          />

          {previewUrl ? (
            <div className="mt-4 max-w-sm rounded-xl border border-zinc-800 bg-zinc-950/80 p-3">
              <img src={previewUrl} alt="preview combo" className="h-40 w-full rounded-lg object-cover" />
            </div>
          ) : null}
        </div>

        {message ? <p className="text-sm text-red-400">{message}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-400">
            Precio del combo: ${priceValue.toFixed(2)} · Productos: {items.length}
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Guardando..." : isEditMode ? "Actualizar combo" : "Guardar combo"}
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
