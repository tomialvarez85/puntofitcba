import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types/database";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("categories").select("*").order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as Category[]) ?? [];
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("categories").select("*").eq("id", id).single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return (data as Category | null) ?? null;
}

export async function getCategoryProductCount(categoryId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (error) {
    throw error;
  }

  return count ?? 0;
}
