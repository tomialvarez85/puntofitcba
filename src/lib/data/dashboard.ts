import { createClient } from "@/lib/supabase/server";

export type DashboardStats = {
  activeProducts: number;
  outOfStockProducts: number;
  activeCombos: number;
  activePromotions: number;
  totalBrands: number;
  totalCategories: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const [
    activeProductsResult,
    outOfStockProductsResult,
    activeCombosResult,
    activePromotionsResult,
    totalBrandsResult,
    totalCategoriesResult,
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("stock", 0),
    supabase.from("combos").select("id", { count: "exact", head: true }).eq("active", true),
    supabase
      .from("promotions")
      .select("id", { count: "exact", head: true })
      .eq("active", true)
      .lte("start_date", now)
      .gte("end_date", now),
    supabase.from("brands").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
  ]);

  for (const result of [
    activeProductsResult,
    outOfStockProductsResult,
    activeCombosResult,
    activePromotionsResult,
    totalBrandsResult,
    totalCategoriesResult,
  ]) {
    if (result.error) {
      throw result.error;
    }
  }

  return {
    activeProducts: activeProductsResult.count ?? 0,
    outOfStockProducts: outOfStockProductsResult.count ?? 0,
    activeCombos: activeCombosResult.count ?? 0,
    activePromotions: activePromotionsResult.count ?? 0,
    totalBrands: totalBrandsResult.count ?? 0,
    totalCategories: totalCategoriesResult.count ?? 0,
  };
}
