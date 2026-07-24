"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createPromotion, updatePromotion } from "@/lib/actions/promotions";
import { formatPrice } from "@/lib/utils/format";
import type { PromotionTarget, PromotionWithLinks } from "@/types/database";

type PromotionFormProps = {
  initialTargets: PromotionTarget[];
  promotion?: PromotionWithLinks | null;
  mode?: "create" | "edit";
};

const initialErrors = {
  name: "",
  start_date: "",
  end_date: "",
  selected_targets: "",
  discount_value: "",
};

function formatDateTimeInput(value: Date) {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default function PromotionForm({ initialTargets, promotion, mode = "create" }: PromotionFormProps) {
  const router = useRouter();
  const isEditMode = mode === "edit";
  const [name, setName] = useState(promotion?.name ?? "");
  const [description, setDescription] = useState(promotion?.description ?? "");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed_amount" | "2x1">(promotion?.discount_type ?? "percentage");
  const [discountValue, setDiscountValue] = useState(promotion?.discount_value?.toString() ?? "20");
  const [startDate, setStartDate] = useState(
    promotion?.start_date ? formatDateTimeInput(new Date(promotion.start_date)) : formatDateTimeInput(new Date()),
  );
  const [endDate, setEndDate] = useState(
    promotion?.end_date ? formatDateTimeInput(new Date(promotion.end_date)) : formatDateTimeInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
  );
  const [selectedTargets, setSelectedTargets] = useState<string[]>(() => {
    if (!promotion?.links) {
      return [];
    }

    return promotion.links.map((link) => `${link.combo_id ? "combo" : "product"}:${link.combo_id ?? link.product_id}`);
  });
  const [active, setActive] = useState(promotion?.active ?? true);
  const [searchTerm, setSearchTerm] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState(initialErrors);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filteredTargets = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return initialTargets.filter((target) => {
      if (!query) {
        return true;
      }

      return target.name.toLowerCase().includes(query);
    });
  }, [initialTargets, searchTerm]);

  const toggleTarget = (targetId: string) => {
    setSelectedTargets((current) =>
      current.includes(targetId) ? current.filter((entry) => entry !== targetId) : [...current, targetId],
    );
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
      start_date: startDate ? "" : "La fecha de inicio es obligatoria.",
      end_date: endDate ? "" : "La fecha de fin es obligatoria.",
      selected_targets: selectedTargets.length > 0 ? "" : "Seleccioná al menos un producto o combo.",
      discount_value:
        discountType === "2x1"
          ? ""
          : Number(discountValue) >= 0 && Number(discountValue) <= 100
            ? ""
            : "El valor debe estar entre 0 y 100.",
    };

    const isValid = new Date(endDate) > new Date(startDate);

    if (!isValid) {
      nextErrors.end_date = "La fecha de fin debe ser posterior a la de inicio.";
    }

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      setMessage("Revisá los campos antes de guardar.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("description", description);
      formData.set("discount_type", discountType);
      formData.set("discount_value", discountType === "2x1" ? "2" : String(discountValue));
      formData.set("start_date", new Date(startDate).toISOString());
      formData.set("end_date", new Date(endDate).toISOString());

      selectedTargets.forEach((target) => {
        formData.append("selected_targets", target);
      });

      if (isEditMode && promotion?.id) {
        formData.set("promotion_id", promotion.id);
      }

      formData.set("active", active ? "on" : "off");

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (isEditMode) {
        await updatePromotion(formData);
      } else {
        await createPromotion(formData);
      }

      router.push("/admin/promotions");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar la promoción.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">{mode === "create" ? "Nueva promoción" : "Editar promoción"}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Creá una regla de descuento temporal sobre productos y combos existentes.
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
            <label className="mb-1 block text-sm font-medium text-zinc-200" htmlFor="discount_type">
              Tipo de descuento
            </label>
            <select
              id="discount_type"
              value={discountType}
              onChange={(event) => {
                const nextValue = event.target.value as "percentage" | "fixed_amount" | "2x1";
                setDiscountType(nextValue);
                if (nextValue === "2x1") {
                  setDiscountValue("2");
                } else if (!discountValue) {
                  setDiscountValue(nextValue === "percentage" ? "20" : "100");
                }
              }}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="percentage">Porcentaje</option>
              <option value="fixed_amount">Monto fijo</option>
              <option value="2x1">2x1</option>
            </select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-200" htmlFor="discount_value">
              Valor del descuento
            </label>
            <div className="flex items-center gap-2">
              <input
                id="discount_value"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={discountValue}
                onChange={(event) => setDiscountValue(event.target.value)}
                disabled={discountType === "2x1"}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none disabled:opacity-60"
              />
              <span className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-300">
                {discountType === "percentage" ? "%" : discountType === "fixed_amount" ? "$" : "x"}
              </span>
            </div>
            {errors.discount_value ? <p className="mt-1 text-sm text-red-400">{errors.discount_value}</p> : null}
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
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-200" htmlFor="start_date">
              Inicio
            </label>
            <input
              id="start_date"
              type="datetime-local"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
            />
            {errors.start_date ? <p className="mt-1 text-sm text-red-400">{errors.start_date}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-200" htmlFor="end_date">
              Fin
            </label>
            <input
              id="end_date"
              type="datetime-local"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
            />
            {errors.end_date ? <p className="mt-1 text-sm text-red-400">{errors.end_date}</p> : null}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">Productos y combos afectados</h2>
            <p className="text-sm text-zinc-400">Buscá y seleccioná qué productos o combos entran en la promoción.</p>
          </div>

          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por nombre"
            className="mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
          />

          <div className="max-h-72 space-y-2 overflow-y-auto pr-2">
            {filteredTargets.map((target) => {
              const isSelected = selectedTargets.includes(`${target.type}:${target.id}`);

              return (
                <label
                  key={`${target.type}-${target.id}`}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-3"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleTarget(`${target.type}:${target.id}`)}
                      className="h-4 w-4 rounded border-zinc-700 bg-zinc-900"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{target.name}</p>
                      <p className="text-xs text-zinc-500">{target.type === "product" ? "Producto" : "Combo"}</p>
                    </div>
                  </div>
                  <div className="text-sm text-zinc-400">{formatPrice(Number(target.price))}</div>
                </label>
              );
            })}
          </div>

          {errors.selected_targets ? <p className="mt-3 text-sm text-red-400">{errors.selected_targets}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-200" htmlFor="image">
            Imagen opcional de la promoción
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
              <img src={previewUrl} alt="preview promoción" className="h-40 w-full rounded-lg object-cover" />
            </div>
          ) : null}

          {isEditMode && promotion?.image_url ? (
            <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-sm text-zinc-400">
              Imagen actual cargada. Si subís otra, reemplazará la anterior.
            </div>
          ) : null}
        </div>

        <label className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-200">
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900"
          />
          Promoción activa / habilitada
        </label>

        {message ? <p className="text-sm text-red-400">{message}</p> : null}

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Guardando..." : isEditMode ? "Actualizar promoción" : "Guardar promoción"}
          </button>
        </div>
      </form>
    </div>
  );
}
