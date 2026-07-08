"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteProductImage, uploadProductImage } from "@/lib/supabase/storage";

function getFormValue(formData: FormData, key: string) {
  return formData.get(key)?.toString() ?? "";
}

export async function createCombo(formData: FormData) {
  const supabase = await createClient();

  const name = getFormValue(formData, "name").trim();
  const slug = getFormValue(formData, "slug").trim();
  const description = getFormValue(formData, "description").trim();
  const price = Number(getFormValue(formData, "price"));
  const active = getFormValue(formData, "active") === "on";
  const productIds = formData.getAll("item_product_ids") as string[];
  const quantities = formData.getAll("item_quantities") as string[];
  const imageFile = formData.get("image");

  if (!name || !slug) {
    throw new Error("Nombre y slug son obligatorios.");
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("El precio debe ser mayor o igual a cero.");
  }

  if (productIds.length === 0 || quantities.length === 0) {
    throw new Error("Agregá al menos un producto al combo.");
  }

  const items = productIds.map((productId, index) => ({
    product_id: productId,
    quantity: Number(quantities[index] || 1),
  }));

  const { data: comboData, error: comboError } = await supabase
    .from("combos")
    .insert({
      name,
      slug,
      description: description || null,
      price,
      active,
    })
    .select("id")
    .single();

  if (comboError) {
    throw new Error(comboError.message || "No se pudo crear el combo.");
  }

  const comboId = comboData.id;

  if (items.length > 0) {
    const { error: itemsError } = await supabase.from("combo_items").insert(
      items.map((item) => ({
        combo_id: comboId,
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    );

    if (itemsError) {
      throw new Error(itemsError.message || "No se pudieron guardar los productos del combo.");
    }
  }

  if (imageFile && imageFile instanceof File && imageFile.size > 0) {
    const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storagePath = `combos/${comboId}/${Date.now()}-${safeName}`;
    const uploadResult = await uploadProductImage(imageFile, storagePath);

    if (!uploadResult) {
      throw new Error("No se pudo subir la imagen del combo.");
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${storagePath}`;
    const { error: imageError } = await supabase.from("combos").update({ image_url: publicUrl }).eq("id", comboId);

    if (imageError) {
      throw new Error(imageError.message || "No se pudo guardar la imagen del combo.");
    }
  }

  revalidatePath("/admin/combos");
  redirect("/admin/combos");
}

export async function updateCombo(formData: FormData) {
  const supabase = await createClient();

  const comboId = getFormValue(formData, "combo_id");
  const name = getFormValue(formData, "name").trim();
  const slug = getFormValue(formData, "slug").trim();
  const description = getFormValue(formData, "description").trim();
  const price = Number(getFormValue(formData, "price"));
  const active = getFormValue(formData, "active") === "on";
  const productIds = formData.getAll("item_product_ids") as string[];
  const quantities = formData.getAll("item_quantities") as string[];
  const imageFile = formData.get("image");

  if (!comboId) {
    throw new Error("No se encontró el combo a actualizar.");
  }

  if (!name || !slug) {
    throw new Error("Nombre y slug son obligatorios.");
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("El precio debe ser mayor o igual a cero.");
  }

  if (productIds.length === 0 || quantities.length === 0) {
    throw new Error("Agregá al menos un producto al combo.");
  }

  const { data: existingCombo } = await supabase.from("combos").select("image_url").eq("id", comboId).single();

  const { error: comboError } = await supabase
    .from("combos")
    .update({
      name,
      slug,
      description: description || null,
      price,
      active,
    })
    .eq("id", comboId);

  if (comboError) {
    throw new Error(comboError.message || "No se pudo actualizar el combo.");
  }

  const { error: deleteItemsError } = await supabase.from("combo_items").delete().eq("combo_id", comboId);
  if (deleteItemsError) {
    throw new Error(deleteItemsError.message || "No se pudieron actualizar los productos del combo.");
  }

  const items = productIds.map((productId, index) => ({
    product_id: productId,
    quantity: Number(quantities[index] || 1),
  }));

  if (items.length > 0) {
    const { error: insertItemsError } = await supabase.from("combo_items").insert(
      items.map((item) => ({
        combo_id: comboId,
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    );

    if (insertItemsError) {
      throw new Error(insertItemsError.message || "No se pudieron guardar los productos del combo.");
    }
  }

  if (imageFile && imageFile instanceof File && imageFile.size > 0) {
    if (existingCombo?.image_url) {
      const oldPath = existingCombo.image_url.split("/public/products/")[1];
      if (oldPath) {
        await deleteProductImage(oldPath);
      }
    }

    const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storagePath = `combos/${comboId}/${Date.now()}-${safeName}`;
    const uploadResult = await uploadProductImage(imageFile, storagePath);

    if (!uploadResult) {
      throw new Error("No se pudo subir la imagen del combo.");
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${storagePath}`;
    const { error: imageError } = await supabase.from("combos").update({ image_url: publicUrl }).eq("id", comboId);

    if (imageError) {
      throw new Error(imageError.message || "No se pudo guardar la imagen del combo.");
    }
  }

  revalidatePath("/admin/combos");
  redirect("/admin/combos");
}

export async function deleteCombo(comboId: string) {
  const supabase = await createClient();

  if (!comboId) {
    throw new Error("No se encontró el combo a eliminar.");
  }

  const { data: combo } = await supabase.from("combos").select("image_url").eq("id", comboId).single();

  if (combo?.image_url) {
    const path = combo.image_url.split("/public/products/")[1];
    if (path) {
      await deleteProductImage(path);
    }
  }

  const { error } = await supabase.from("combos").delete().eq("id", comboId);

  if (error) {
    throw new Error(error.message || "No se pudo eliminar el combo.");
  }

  revalidatePath("/admin/combos");
}

export async function toggleComboActive(comboId: string, active: boolean) {
  const supabase = await createClient();

  if (!comboId) {
    throw new Error("No se encontró el combo a actualizar.");
  }

  const { error } = await supabase.from("combos").update({ active }).eq("id", comboId);

  if (error) {
    throw new Error(error.message || "No se pudo actualizar el estado del combo.");
  }

  revalidatePath("/admin/combos");
}
