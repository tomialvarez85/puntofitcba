import { createClient } from "@/lib/supabase/server";
import type { Combo, Product } from "@/types/database";

export async function getCombos(): Promise<Combo[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("combos")
    .select(
      `
        id,
        name,
        slug,
        description,
        price,
        image_url,
        active,
        created_at,
        updated_at,
        items:combo_items(
          id,
          combo_id,
          product_id,
          quantity,
          product:products(id, name, slug, price, active)
        )
      `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as unknown as Combo[]) ?? [];
}

export async function getComboById(id: string): Promise<Combo | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("combos")
    .select(
      `
        id,
        name,
        slug,
        description,
        price,
        image_url,
        active,
        created_at,
        updated_at,
        items:combo_items(
          id,
          combo_id,
          product_id,
          quantity,
          product:products(id, name, slug, price, active)
        )
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

  return (data as unknown as Combo | null) ?? null;
}

export async function getActiveProducts(): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, price, stock, active")
    .eq("active", true)
    .order("name");

  if (error) {
    throw error;
  }

  return (data as unknown as Product[]) ?? [];
}
