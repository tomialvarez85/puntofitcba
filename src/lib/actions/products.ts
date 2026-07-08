"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteProductImage, uploadProductImage } from "@/lib/supabase/storage";

function getFormValue(formData: FormData, key: string) {
  return formData.get(key)?.toString() ?? "";
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();

  const name = getFormValue(formData, "name").trim();
  const slug = getFormValue(formData, "slug").trim();
  const description = getFormValue(formData, "description").trim();
  const price = Number(getFormValue(formData, "price"));
  const stock = Number(getFormValue(formData, "stock"));
  const categoryId = getFormValue(formData, "category_id") || null;
  const brandId = getFormValue(formData, "brand_id") || null;
  const active = getFormValue(formData, "active") === "on";

  if (!name || !slug) {
    throw new Error("Nombre y slug son obligatorios.");
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("El precio debe ser mayor o igual a cero.");
  }

  if (!Number.isFinite(stock) || stock < 0) {
    throw new Error("El stock debe ser mayor o igual a cero.");
  }

  const { data: productData, error: productError } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      description: description || null,
      price,
      stock,
      category_id: categoryId,
      brand_id: brandId,
      active,
    })
    .select("id")
    .single();

  if (productError) {
    throw new Error(productError.message || "No se pudo crear el producto.");
  }

  const productId = productData.id;
  const uploadedImages: { url: string; is_primary: boolean; sort_order: number }[] = [];
  const imageFiles = formData.getAll("images") as File[];

  for (const [index, file] of imageFiles.entries()) {
    if (!(file instanceof File) || file.size === 0) {
      continue;
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storagePath = `${productId}/${Date.now()}-${index}-${safeName}`;

    const uploadResult = await uploadProductImage(file, storagePath);
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${storagePath}`;

    uploadedImages.push({
      url: publicUrl,
      is_primary: index === 0,
      sort_order: index,
    });

    if (!uploadResult) {
      throw new Error("No se pudo subir una imagen.");
    }
  }

  if (uploadedImages.length > 0) {
    const { error: imagesError } = await supabase.from("product_images").insert(
      uploadedImages.map((image) => ({
        product_id: productId,
        url: image.url,
        is_primary: image.is_primary,
        sort_order: image.sort_order,
      })),
    );

    if (imagesError) {
      await Promise.all(
        uploadedImages.map(async (image) => {
          const path = image.url.split("/public/products/")[1];
          if (path) {
            await deleteProductImage(path);
          }
        }),
      );
      throw new Error(imagesError.message || "No se pudieron guardar las imágenes.");
    }
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();

  if (!productId) {
    throw new Error("No se encontró el producto a eliminar.");
  }

  const { data: productImages } = await supabase.from("product_images").select("url").eq("product_id", productId);

  if (productImages && productImages.length > 0) {
    await Promise.all(
      productImages.map(async (image) => {
        const path = image.url.split("/public/products/")[1];
        if (path) {
          await deleteProductImage(path);
        }
      }),
    );
  }

  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    throw new Error(error.message || "No se pudo eliminar el producto.");
  }

  revalidatePath("/admin/products");
}

export async function toggleProductActive(productId: string, active: boolean) {
  const supabase = await createClient();

  if (!productId) {
    throw new Error("No se encontró el producto a actualizar.");
  }

  const { error } = await supabase.from("products").update({ active }).eq("id", productId);

  if (error) {
    throw new Error(error.message || "No se pudo actualizar el estado del producto.");
  }

  revalidatePath("/admin/products");
}

export async function updateProduct(formData: FormData) {
  const supabase = await createClient();

  const productId = getFormValue(formData, "product_id");
  const name = getFormValue(formData, "name").trim();
  const slug = getFormValue(formData, "slug").trim();
  const description = getFormValue(formData, "description").trim();
  const price = Number(getFormValue(formData, "price"));
  const stock = Number(getFormValue(formData, "stock"));
  const categoryId = getFormValue(formData, "category_id") || null;
  const brandId = getFormValue(formData, "brand_id") || null;
  const active = getFormValue(formData, "active") === "on";
  const primaryImageId = getFormValue(formData, "primary_image_id");
  const deleteImageIds = formData.getAll("delete_image_ids") as string[];
  const imageFiles = formData.getAll("images") as File[];
  const primaryImageIndex = Number(getFormValue(formData, "primary_image_index"));

  if (!productId) {
    throw new Error("No se encontró el producto a actualizar.");
  }

  if (!name || !slug) {
    throw new Error("Nombre y slug son obligatorios.");
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("El precio debe ser mayor o igual a cero.");
  }

  if (!Number.isFinite(stock) || stock < 0) {
    throw new Error("El stock debe ser mayor o igual a cero.");
  }

  const { error: productError } = await supabase
    .from("products")
    .update({
      name,
      slug,
      description: description || null,
      price,
      stock,
      category_id: categoryId,
      brand_id: brandId,
      active,
    })
    .eq("id", productId);

  if (productError) {
    throw new Error(productError.message || "No se pudo actualizar el producto.");
  }

  if (deleteImageIds.length > 0) {
    const { data: imagesToDelete } = await supabase
      .from("product_images")
      .select("id, url")
      .in("id", deleteImageIds)
      .eq("product_id", productId);

    if (imagesToDelete) {
      for (const image of imagesToDelete) {
        const path = image.url.split("/public/products/")[1];
        if (path) {
          await deleteProductImage(path);
        }
      }
    }

    const { error: deleteError } = await supabase.from("product_images").delete().in("id", deleteImageIds);

    if (deleteError) {
      throw new Error(deleteError.message || "No se pudieron eliminar las imágenes.");
    }
  }

  const uploadedImages: { url: string; is_primary: boolean; sort_order: number }[] = [];

  for (const [index, file] of imageFiles.entries()) {
    if (!(file instanceof File) || file.size === 0) {
      continue;
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storagePath = `${productId}/${Date.now()}-${index}-${safeName}`;

    const uploadResult = await uploadProductImage(file, storagePath);
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${storagePath}`;

    uploadedImages.push({
      url: publicUrl,
      is_primary: false,
      sort_order: index,
    });

    if (!uploadResult) {
      throw new Error("No se pudo subir una imagen.");
    }
  }

  if (uploadedImages.length > 0) {
    const { error: imagesError } = await supabase.from("product_images").insert(
      uploadedImages.map((image) => ({
        product_id: productId,
        url: image.url,
        is_primary: false,
        sort_order: image.sort_order,
      })),
    );

    if (imagesError) {
      await Promise.all(
        uploadedImages.map(async (image) => {
          const path = image.url.split("/public/products/")[1];
          if (path) {
            await deleteProductImage(path);
          }
        }),
      );
      throw new Error(imagesError.message || "No se pudieron guardar las imágenes.");
    }
  }

  if (primaryImageId || uploadedImages.length > 0) {
    const { data: existingImages } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", productId);

    if (existingImages) {
      await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);

      if (primaryImageId && !primaryImageId.startsWith("new:")) {
        await supabase.from("product_images").update({ is_primary: true }).eq("id", primaryImageId);
      }

      if (uploadedImages.length > 0 && primaryImageId?.startsWith("new:")) {
        const { data: insertedImages } = await supabase
          .from("product_images")
          .select("id")
          .eq("product_id", productId)
          .order("sort_order", { ascending: true });

        const firstInsertedId = insertedImages?.[0]?.id;
        if (firstInsertedId) {
          await supabase.from("product_images").update({ is_primary: true }).eq("id", firstInsertedId);
        }
      }
    }
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}
