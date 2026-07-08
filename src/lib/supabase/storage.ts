import { createClient } from "@/lib/supabase/server";

export async function uploadProductImage(file: File, path: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.storage.from("products").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function getProductImageUrl(path: string) {
  const supabase = await createClient();

  const { data } = supabase.storage.from("products").getPublicUrl(path);

  return data.publicUrl;
}

export async function deleteProductImage(path: string) {
  const supabase = await createClient();

  const { error } = await supabase.storage.from("products").remove([path]);

  if (error) {
    throw error;
  }
}

export async function uploadBrandLogo(file: File, path: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.storage.from("brands").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteBrandLogo(path: string) {
  const supabase = await createClient();

  const { error } = await supabase.storage.from("brands").remove([path]);

  if (error) {
    throw error;
  }
}
