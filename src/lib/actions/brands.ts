"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteBrandLogo, uploadBrandLogo } from "@/lib/supabase/storage";
import { getBrandProductCount } from "@/lib/data/brands";

function getFormValue(formData: FormData, key: string) {
  return formData.get(key)?.toString() ?? "";
}

export async function createBrand(formData: FormData) {
  const supabase = await createClient();

  const name = getFormValue(formData, "name").trim();
  const slug = getFormValue(formData, "slug").trim();
  const logoFile = formData.get("logo");

  if (!name || !slug) {
    throw new Error("Nombre y slug son obligatorios.");
  }

  const { data: brandData, error: brandError } = await supabase
    .from("brands")
    .insert({ name, slug })
    .select("id")
    .single();

  if (brandError) {
    throw new Error(brandError.message || "No se pudo crear la marca.");
  }

  const brandId = brandData.id;

  if (logoFile && logoFile instanceof File && logoFile.size > 0) {
    const safeName = logoFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storagePath = `${brandId}/${Date.now()}-${safeName}`;
    const uploadResult = await uploadBrandLogo(logoFile, storagePath);

    if (!uploadResult) {
      throw new Error("No se pudo subir el logo de la marca.");
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/brands/${storagePath}`;
    const { error: logoError } = await supabase.from("brands").update({ logo_url: publicUrl }).eq("id", brandId);

    if (logoError) {
      throw new Error(logoError.message || "No se pudo guardar el logo de la marca.");
    }
  }

  revalidatePath("/admin/brands");
  redirect("/admin/brands");
}

export async function updateBrand(formData: FormData) {
  const supabase = await createClient();

  const brandId = getFormValue(formData, "brand_id");
  const name = getFormValue(formData, "name").trim();
  const slug = getFormValue(formData, "slug").trim();
  const logoFile = formData.get("logo");

  if (!brandId) {
    throw new Error("No se encontró la marca a actualizar.");
  }

  if (!name || !slug) {
    throw new Error("Nombre y slug son obligatorios.");
  }

  const { data: existingBrand } = await supabase.from("brands").select("logo_url").eq("id", brandId).single();

  const { error: brandError } = await supabase.from("brands").update({ name, slug }).eq("id", brandId);

  if (brandError) {
    throw new Error(brandError.message || "No se pudo actualizar la marca.");
  }

  if (logoFile && logoFile instanceof File && logoFile.size > 0) {
    if (existingBrand?.logo_url) {
      const oldPath = existingBrand.logo_url.split("/public/brands/")[1];
      if (oldPath) {
        await deleteBrandLogo(oldPath);
      }
    }

    const safeName = logoFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storagePath = `${brandId}/${Date.now()}-${safeName}`;
    const uploadResult = await uploadBrandLogo(logoFile, storagePath);

    if (!uploadResult) {
      throw new Error("No se pudo subir el logo de la marca.");
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/brands/${storagePath}`;
    const { error: logoError } = await supabase.from("brands").update({ logo_url: publicUrl }).eq("id", brandId);

    if (logoError) {
      throw new Error(logoError.message || "No se pudo guardar el logo de la marca.");
    }
  }

  revalidatePath("/admin/brands");
  redirect("/admin/brands");
}

export async function deleteBrand(brandId: string) {
  const supabase = await createClient();

  if (!brandId) {
    throw new Error("No se encontró la marca a eliminar.");
  }

  const productCount = await getBrandProductCount(brandId);

  if (productCount > 0) {
    throw new Error(
      `No se puede eliminar: hay ${productCount} producto${productCount === 1 ? "" : "s"} usando esta marca. Reasigná esos productos a otra marca o a "Sin marca" antes de eliminarla.`,
    );
  }

  const { data: brand } = await supabase.from("brands").select("logo_url").eq("id", brandId).single();

  if (brand?.logo_url) {
    const path = brand.logo_url.split("/public/brands/")[1];
    if (path) {
      await deleteBrandLogo(path);
    }
  }

  const { error } = await supabase.from("brands").delete().eq("id", brandId);

  if (error) {
    throw new Error(error.message || "No se pudo eliminar la marca.");
  }

  revalidatePath("/admin/brands");
}
