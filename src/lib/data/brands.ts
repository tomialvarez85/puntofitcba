import { createClient } from "@/lib/supabase/server";
import type { Brand } from "@/types/database";

export async function getBrands(): Promise<Brand[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("brands").select("*").order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as Brand[]) ?? [];
}

export async function getBrandById(id: string): Promise<Brand | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("brands").select("*").eq("id", id).single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return (data as Brand | null) ?? null;
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("brands").select("*").eq("slug", slug).maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Brand | null) ?? null;
}

export async function getBrandProductCount(brandId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("brand_id", brandId);

  if (error) {
    throw error;
  }

  return count ?? 0;
}
