"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteProductImage, uploadProductImage } from "@/lib/supabase/storage";

function getFormValue(formData: FormData, key: string) {
  return formData.get(key)?.toString() ?? "";
}

export async function createPromotion(formData: FormData) {
  const supabase = await createClient();

  const name = getFormValue(formData, "name").trim();
  const description = getFormValue(formData, "description").trim();
  const discountType = getFormValue(formData, "discount_type") as "percentage" | "fixed_amount" | "2x1";
  const discountValue = Number(getFormValue(formData, "discount_value") || 0);
  const startDate = getFormValue(formData, "start_date");
  const endDate = getFormValue(formData, "end_date");
  const selectedTargets = formData.getAll("selected_targets") as string[];
  const imageFile = formData.get("image");

  if (!name) {
    throw new Error("El nombre de la promoción es obligatorio.");
  }

  if (!startDate || !endDate) {
    throw new Error("Las fechas de inicio y fin son obligatorias.");
  }

  if (!selectedTargets.length) {
    throw new Error("Seleccioná al menos un producto o combo.");
  }

  if (new Date(endDate) <= new Date(startDate)) {
    throw new Error("La fecha de fin debe ser posterior a la de inicio.");
  }

  const { data: promotionData, error: promotionError } = await supabase
    .from("promotions")
    .insert({
      name,
      description: description || null,
      discount_type: discountType,
      discount_value: discountType === "2x1" ? 2 : discountValue,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      active: true,
    })
    .select("id")
    .single();

  if (promotionError) {
    throw new Error(promotionError.message || "No se pudo crear la promoción.");
  }

  const promotionId = promotionData.id;
  const links = selectedTargets.map((target) => {
    if (target.startsWith("product:")) {
      return {
        promotion_id: promotionId,
        product_id: target.replace("product:", ""),
        combo_id: null,
      };
    }

    return {
      promotion_id: promotionId,
      product_id: null,
      combo_id: target.replace("combo:", ""),
    };
  });

  if (links.length > 0) {
    const { error: linksError } = await supabase.from("promotion_products").insert(links);

    if (linksError) {
      throw new Error(linksError.message || "No se pudieron vincular los productos o combos.");
    }
  }

  if (imageFile && imageFile instanceof File && imageFile.size > 0) {
    const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storagePath = `promotions/${promotionId}/${Date.now()}-${safeName}`;
    const uploadResult = await uploadProductImage(imageFile, storagePath);

    if (!uploadResult) {
      throw new Error("No se pudo subir la imagen de la promoción.");
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${storagePath}`;
    const { error: imageError } = await supabase.from("promotions").update({ image_url: publicUrl }).eq("id", promotionId);

    if (imageError) {
      throw new Error(imageError.message || "No se pudo guardar la imagen de la promoción.");
    }
  }

  revalidatePath("/admin/promotions");
  redirect("/admin/promotions");
}

export async function updatePromotion(formData: FormData) {
  const supabase = await createClient();

  const promotionId = getFormValue(formData, "promotion_id");
  const name = getFormValue(formData, "name").trim();
  const description = getFormValue(formData, "description").trim();
  const discountType = getFormValue(formData, "discount_type") as "percentage" | "fixed_amount" | "2x1";
  const discountValue = Number(getFormValue(formData, "discount_value") || 0);
  const startDate = getFormValue(formData, "start_date");
  const endDate = getFormValue(formData, "end_date");
  const selectedTargets = formData.getAll("selected_targets") as string[];
  const imageFile = formData.get("image");
  const active = getFormValue(formData, "active") === "on";

  if (!promotionId) {
    throw new Error("No se encontró la promoción a actualizar.");
  }

  if (!name) {
    throw new Error("El nombre de la promoción es obligatorio.");
  }

  if (!selectedTargets.length) {
    throw new Error("Seleccioná al menos un producto o combo.");
  }

  if (new Date(endDate) <= new Date(startDate)) {
    throw new Error("La fecha de fin debe ser posterior a la de inicio.");
  }

  const { data: existingPromotion } = await supabase.from("promotions").select("image_url").eq("id", promotionId).single();

  const { error: promoError } = await supabase
    .from("promotions")
    .update({
      name,
      description: description || null,
      discount_type: discountType,
      discount_value: discountType === "2x1" ? 2 : discountValue,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      active,
    })
    .eq("id", promotionId);

  if (promoError) {
    throw new Error(promoError.message || "No se pudo actualizar la promoción.");
  }

  const { error: deleteLinksError } = await supabase.from("promotion_products").delete().eq("promotion_id", promotionId);
  if (deleteLinksError) {
    throw new Error(deleteLinksError.message || "No se pudieron actualizar los vínculos de la promoción.");
  }

  const links = selectedTargets.map((target) => {
    if (target.startsWith("product:")) {
      return {
        promotion_id: promotionId,
        product_id: target.replace("product:", ""),
        combo_id: null,
      };
    }

    return {
      promotion_id: promotionId,
      product_id: null,
      combo_id: target.replace("combo:", ""),
    };
  });

  if (links.length > 0) {
    const { error: linksError } = await supabase.from("promotion_products").insert(links);
    if (linksError) {
      throw new Error(linksError.message || "No se pudieron actualizar los productos o combos vinculados.");
    }
  }

  if (imageFile && imageFile instanceof File && imageFile.size > 0) {
    if (existingPromotion?.image_url) {
      const oldPath = existingPromotion.image_url.split("/public/products/")[1];
      if (oldPath) {
        await deleteProductImage(oldPath);
      }
    }

    const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storagePath = `promotions/${promotionId}/${Date.now()}-${safeName}`;
    const uploadResult = await uploadProductImage(imageFile, storagePath);

    if (!uploadResult) {
      throw new Error("No se pudo subir la imagen de la promoción.");
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${storagePath}`;
    const { error: imageError } = await supabase.from("promotions").update({ image_url: publicUrl }).eq("id", promotionId);

    if (imageError) {
      throw new Error(imageError.message || "No se pudo guardar la imagen de la promoción.");
    }
  }

  revalidatePath("/admin/promotions");
  redirect("/admin/promotions");
}

export async function deletePromotion(promotionId: string) {
  const supabase = await createClient();

  if (!promotionId) {
    throw new Error("No se encontró la promoción a eliminar.");
  }

  const { data: promotion } = await supabase.from("promotions").select("image_url").eq("id", promotionId).single();

  if (promotion?.image_url) {
    const path = promotion.image_url.split("/public/products/")[1];
    if (path) {
      await deleteProductImage(path);
    }
  }

  const { error } = await supabase.from("promotions").delete().eq("id", promotionId);

  if (error) {
    throw new Error(error.message || "No se pudo eliminar la promoción.");
  }

  revalidatePath("/admin/promotions");
}
