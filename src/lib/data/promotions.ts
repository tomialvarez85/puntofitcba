import { createClient } from "@/lib/supabase/server";
import type { PromotionTarget, PromotionWithLinks } from "@/types/database";

export async function getPromotions(): Promise<PromotionWithLinks[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("promotions")
    .select(
      `
        id,
        name,
        description,
        discount_type,
        discount_value,
        image_url,
        start_date,
        end_date,
        active,
        created_at,
        links:promotion_products(
          id,
          promotion_id,
          product_id,
          combo_id,
          product:products(id, name, slug, price, active),
          combo:combos(id, name, slug, price, active)
        )
      `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as unknown as PromotionWithLinks[]) ?? [];
}

export async function getPromotionById(id: string): Promise<PromotionWithLinks | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("promotions")
    .select(
      `
        id,
        name,
        description,
        discount_type,
        discount_value,
        image_url,
        start_date,
        end_date,
        active,
        created_at,
        links:promotion_products(
          id,
          promotion_id,
          product_id,
          combo_id,
          product:products(id, name, slug, price, active),
          combo:combos(id, name, slug, price, active)
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

  return (data as unknown as PromotionWithLinks | null) ?? null;
}

export async function getPromotionTargets(): Promise<PromotionTarget[]> {
  const supabase = await createClient();

  const [productsResult, combosResult] = await Promise.all([
    supabase.from("products").select("id, name, price, active").eq("active", true).order("name"),
    supabase.from("combos").select("id, name, price, active").eq("active", true).order("name"),
  ]);

  if (productsResult.error) {
    throw productsResult.error;
  }

  if (combosResult.error) {
    throw combosResult.error;
  }

  const products = (productsResult.data ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    type: "product" as const,
    price: Number(product.price),
    active: Boolean(product.active),
  }));

  const combos = (combosResult.data ?? []).map((combo) => ({
    id: combo.id,
    name: combo.name,
    type: "combo" as const,
    price: Number(combo.price),
    active: Boolean(combo.active),
  }));

  return [...products, ...combos];
}

