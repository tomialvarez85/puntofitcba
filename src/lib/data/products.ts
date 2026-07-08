import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";

export { getCategories } from "@/lib/data/categories";
export { getBrands } from "@/lib/data/brands";

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
        id,
        name,
        slug,
        description,
        price,
        stock,
        category_id,
        brand_id,
        active,
        created_at,
        updated_at,
        category:categories(id, name, slug, created_at),
        brand:brands(id, name, slug, logo_url, created_at),
        images:product_images(id, product_id, url, is_primary, sort_order)
      `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as unknown as Product[]) ?? [];
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
        id,
        name,
        slug,
        description,
        price,
        stock,
        category_id,
        brand_id,
        active,
        created_at,
        updated_at,
        category:categories(id, name, slug, created_at),
        brand:brands(id, name, slug, logo_url, created_at),
        images:product_images(id, product_id, url, is_primary, sort_order)
      `,
    )
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return (data as unknown as Product | null) ?? null;
}

