"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteTestimonialPhoto, uploadTestimonialPhoto } from "@/lib/supabase/storage";

function getFormValue(formData: FormData, key: string) {
  return formData.get(key)?.toString() ?? "";
}

async function getNextDisplayOrder(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase
    .from("testimonials")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.display_order ?? -1) + 1;
}

export async function createTestimonial(formData: FormData) {
  const supabase = await createClient();

  const customerName = getFormValue(formData, "customer_name").trim();
  const reviewText = getFormValue(formData, "review_text").trim();
  const displayOrderRaw = getFormValue(formData, "display_order").trim();
  const photoFile = formData.get("photo");

  if (!customerName || !reviewText) {
    throw new Error("El nombre del cliente y la reseña son obligatorios.");
  }

  const displayOrder = displayOrderRaw ? Number(displayOrderRaw) : await getNextDisplayOrder(supabase);

  if (!Number.isFinite(displayOrder)) {
    throw new Error("El orden de aparición debe ser un número.");
  }

  const { data: testimonialData, error: testimonialError } = await supabase
    .from("testimonials")
    .insert({
      customer_name: customerName,
      review_text: reviewText,
      display_order: displayOrder,
      active: true,
    })
    .select("id")
    .single();

  if (testimonialError) {
    throw new Error(testimonialError.message || "No se pudo crear el testimonio.");
  }

  const testimonialId = testimonialData.id;

  if (photoFile && photoFile instanceof File && photoFile.size > 0) {
    const safeName = photoFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storagePath = `${testimonialId}/${Date.now()}-${safeName}`;
    const uploadResult = await uploadTestimonialPhoto(photoFile, storagePath);

    if (!uploadResult) {
      throw new Error("No se pudo subir la foto del cliente.");
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/testimonials/${storagePath}`;
    const { error: photoError } = await supabase
      .from("testimonials")
      .update({ photo_url: publicUrl })
      .eq("id", testimonialId);

    if (photoError) {
      throw new Error(photoError.message || "No se pudo guardar la foto del cliente.");
    }
  }

  revalidatePath("/admin/testimonials");
  redirect("/admin/testimonials");
}

export async function updateTestimonial(formData: FormData) {
  const supabase = await createClient();

  const testimonialId = getFormValue(formData, "testimonial_id");
  const customerName = getFormValue(formData, "customer_name").trim();
  const reviewText = getFormValue(formData, "review_text").trim();
  const displayOrderRaw = getFormValue(formData, "display_order").trim();
  const photoFile = formData.get("photo");

  if (!testimonialId) {
    throw new Error("No se encontró el testimonio a actualizar.");
  }

  if (!customerName || !reviewText) {
    throw new Error("El nombre del cliente y la reseña son obligatorios.");
  }

  const displayOrder = displayOrderRaw ? Number(displayOrderRaw) : await getNextDisplayOrder(supabase);

  if (!Number.isFinite(displayOrder)) {
    throw new Error("El orden de aparición debe ser un número.");
  }

  const { data: existingTestimonial } = await supabase
    .from("testimonials")
    .select("photo_url")
    .eq("id", testimonialId)
    .single();

  const { error: testimonialError } = await supabase
    .from("testimonials")
    .update({
      customer_name: customerName,
      review_text: reviewText,
      display_order: displayOrder,
    })
    .eq("id", testimonialId);

  if (testimonialError) {
    throw new Error(testimonialError.message || "No se pudo actualizar el testimonio.");
  }

  if (photoFile && photoFile instanceof File && photoFile.size > 0) {
    if (existingTestimonial?.photo_url) {
      const oldPath = existingTestimonial.photo_url.split("/public/testimonials/")[1];
      if (oldPath) {
        await deleteTestimonialPhoto(oldPath);
      }
    }

    const safeName = photoFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storagePath = `${testimonialId}/${Date.now()}-${safeName}`;
    const uploadResult = await uploadTestimonialPhoto(photoFile, storagePath);

    if (!uploadResult) {
      throw new Error("No se pudo subir la foto del cliente.");
    }

    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/testimonials/${storagePath}`;
    const { error: photoError } = await supabase
      .from("testimonials")
      .update({ photo_url: publicUrl })
      .eq("id", testimonialId);

    if (photoError) {
      throw new Error(photoError.message || "No se pudo guardar la foto del cliente.");
    }
  }

  revalidatePath("/admin/testimonials");
  redirect("/admin/testimonials");
}

export async function deleteTestimonial(testimonialId: string) {
  const supabase = await createClient();

  if (!testimonialId) {
    throw new Error("No se encontró el testimonio a eliminar.");
  }

  const { data: testimonial } = await supabase
    .from("testimonials")
    .select("photo_url")
    .eq("id", testimonialId)
    .single();

  if (testimonial?.photo_url) {
    const path = testimonial.photo_url.split("/public/testimonials/")[1];
    if (path) {
      await deleteTestimonialPhoto(path);
    }
  }

  const { error } = await supabase.from("testimonials").delete().eq("id", testimonialId);

  if (error) {
    throw new Error(error.message || "No se pudo eliminar el testimonio.");
  }

  revalidatePath("/admin/testimonials");
}

export async function toggleTestimonialActive(testimonialId: string, active: boolean) {
  const supabase = await createClient();

  if (!testimonialId) {
    throw new Error("No se encontró el testimonio a actualizar.");
  }

  const { error } = await supabase.from("testimonials").update({ active }).eq("id", testimonialId);

  if (error) {
    throw new Error(error.message || "No se pudo actualizar el estado del testimonio.");
  }

  revalidatePath("/admin/testimonials");
}
