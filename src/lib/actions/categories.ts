"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCategoryProductCount } from "@/lib/data/categories";

function getFormValue(formData: FormData, key: string) {
  return formData.get(key)?.toString() ?? "";
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient();

  const name = getFormValue(formData, "name").trim();
  const slug = getFormValue(formData, "slug").trim();

  if (!name || !slug) {
    throw new Error("Nombre y slug son obligatorios.");
  }

  const { error } = await supabase.from("categories").insert({ name, slug });

  if (error) {
    throw new Error(error.message || "No se pudo crear la categoría.");
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(formData: FormData) {
  const supabase = await createClient();

  const categoryId = getFormValue(formData, "category_id");
  const name = getFormValue(formData, "name").trim();
  const slug = getFormValue(formData, "slug").trim();

  if (!categoryId) {
    throw new Error("No se encontró la categoría a actualizar.");
  }

  if (!name || !slug) {
    throw new Error("Nombre y slug son obligatorios.");
  }

  const { error } = await supabase.from("categories").update({ name, slug }).eq("id", categoryId);

  if (error) {
    throw new Error(error.message || "No se pudo actualizar la categoría.");
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();

  if (!categoryId) {
    throw new Error("No se encontró la categoría a eliminar.");
  }

  const productCount = await getCategoryProductCount(categoryId);

  if (productCount > 0) {
    throw new Error(
      `No se puede eliminar: hay ${productCount} producto${productCount === 1 ? "" : "s"} usando esta categoría. Reasigná esos productos a otra categoría o a "Sin categoría" antes de eliminarla.`,
    );
  }

  const { error } = await supabase.from("categories").delete().eq("id", categoryId);

  if (error) {
    throw new Error(error.message || "No se pudo eliminar la categoría.");
  }

  revalidatePath("/admin/categories");
}
