import { createClient } from "@/lib/supabase/server";
import { calculateDiscountedPrice, getPromotionStatus } from "@/lib/utils/promotion-status";
import type { Brand, ComboWithItems, Product, PromotionWithLinks } from "@/types/database";

export { getCategories } from "@/lib/data/categories";

export async function getBrandsWithProducts(): Promise<Brand[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("brands")
    .select("id, name, slug, logo_url, created_at, products:products!inner(id)")
    .eq("products.active", true)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = (data as unknown as (Brand & { products: { id: string }[] })[]) ?? [];

  return rows.map(({ products: _products, ...brand }) => brand);
}

export async function getHeroImages(limit = 12): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
        id,
        active,
        created_at,
        images:product_images(url, is_primary, sort_order)
      `,
    )
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  const products = (data as unknown as Product[]) ?? [];

  const urls = products
    .map((product) => {
      const images = product.images ?? [];
      if (images.length === 0) {
        return null;
      }

      const primaryImage = images.find((image) => image.is_primary) ?? images[0];
      return primaryImage.url;
    })
    .filter((url): url is string => Boolean(url));

  for (let i = urls.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [urls[i], urls[j]] = [urls[j], urls[i]];
  }

  return urls.slice(0, limit);
}

export type CatalogSortBy = "newest" | "price_asc" | "price_desc";

function sanitizeSearchTerm(term: string) {
  return term.replace(/[%,()]/g, " ").trim();
}

type PromotionDiscount = {
  discount_type: "percentage" | "fixed_amount" | "2x1";
  discount_value: number | null;
};

async function getActivePromotionDiscountMaps(): Promise<{
  productMap: Map<string, PromotionDiscount>;
  comboMap: Map<string, PromotionDiscount>;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("promotions")
    .select(
      `
        discount_type,
        discount_value,
        start_date,
        end_date,
        active,
        links:promotion_products(product_id, combo_id)
      `,
    )
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const productMap = new Map<string, PromotionDiscount>();
  const comboMap = new Map<string, PromotionDiscount>();

  for (const promotion of data ?? []) {
    if (getPromotionStatus(promotion.start_date, promotion.end_date, promotion.active) !== "Activa") {
      continue;
    }

    for (const link of promotion.links ?? []) {
      if (link.product_id && !productMap.has(link.product_id)) {
        productMap.set(link.product_id, {
          discount_type: promotion.discount_type,
          discount_value: promotion.discount_value,
        });
      }

      if (link.combo_id && !comboMap.has(link.combo_id)) {
        comboMap.set(link.combo_id, {
          discount_type: promotion.discount_type,
          discount_value: promotion.discount_value,
        });
      }
    }
  }

  return { productMap, comboMap };
}

export type CatalogProductFilters = {
  categorySlug?: string;
  brandSlug?: string;
  searchTerm?: string;
  sortBy?: CatalogSortBy;
};

export type CatalogProduct = Product & {
  originalPrice: number;
  discountedPrice: number;
  hasDiscount: boolean;
};

export async function getCatalogProducts(filters: CatalogProductFilters = {}): Promise<CatalogProduct[]> {
  const supabase = await createClient();
  const { categorySlug, brandSlug, searchTerm, sortBy = "newest" } = filters;

  let categoryId: string | null = null;

  if (categorySlug) {
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .maybeSingle();

    if (categoryError) {
      throw categoryError;
    }

    if (!category) {
      return [];
    }

    categoryId = category.id;
  }

  let brandId: string | null = null;

  if (brandSlug) {
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("id")
      .eq("slug", brandSlug)
      .maybeSingle();

    if (brandError) {
      throw brandError;
    }

    if (!brand) {
      return [];
    }

    brandId = brand.id;
  }

  let query = supabase
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
        active,
        created_at,
        updated_at,
        category:categories(id, name, slug, created_at),
        images:product_images(id, product_id, url, is_primary, sort_order)
      `,
    )
    .eq("active", true);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (brandId) {
    query = query.eq("brand_id", brandId);
  }

  const cleanSearchTerm = searchTerm ? sanitizeSearchTerm(searchTerm) : "";

  if (cleanSearchTerm) {
    query = query.or(`name.ilike.%${cleanSearchTerm}%,description.ilike.%${cleanSearchTerm}%`);
  }

  if (sortBy === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (sortBy === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const products = (data as unknown as Product[]) ?? [];
  const { productMap } = await getActivePromotionDiscountMaps();

  return products.map((product) => {
    const originalPrice = Number(product.price);
    const promo = productMap.get(product.id);
    const discountedPrice = promo
      ? calculateDiscountedPrice(originalPrice, promo.discount_type, promo.discount_value)
      : originalPrice;

    return {
      ...product,
      originalPrice,
      discountedPrice,
      hasDiscount: discountedPrice < originalPrice,
    };
  });
}

export type CatalogComboFilters = {
  searchTerm?: string;
  sortBy?: CatalogSortBy;
};

export type CatalogCombo = ComboWithItems & {
  originalPrice: number;
  discountedPrice: number;
  hasDiscount: boolean;
};

export async function getCatalogCombos(filters: CatalogComboFilters = {}): Promise<CatalogCombo[]> {
  const supabase = await createClient();
  const { searchTerm, sortBy = "newest" } = filters;

  let query = supabase
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
    .eq("active", true);

  const cleanSearchTerm = searchTerm ? sanitizeSearchTerm(searchTerm) : "";

  if (cleanSearchTerm) {
    query = query.or(`name.ilike.%${cleanSearchTerm}%,description.ilike.%${cleanSearchTerm}%`);
  }

  if (sortBy === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (sortBy === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const combos = (data as unknown as ComboWithItems[]) ?? [];
  const { comboMap } = await getActivePromotionDiscountMaps();

  return combos.map((combo) => {
    const originalPrice = Number(combo.price);
    const promo = comboMap.get(combo.id);
    const discountedPrice = promo
      ? calculateDiscountedPrice(originalPrice, promo.discount_type, promo.discount_value)
      : originalPrice;

    return {
      ...combo,
      originalPrice,
      discountedPrice,
      hasDiscount: discountedPrice < originalPrice,
    };
  });
}

export type PromotedSortBy = "discount_desc" | "newest";

export type PromotedItem =
  | { type: "product"; data: CatalogProduct }
  | { type: "combo"; data: CatalogCombo };

export type PromotedItemsFilters = {
  sortBy?: PromotedSortBy;
};

export async function getActivePromotedItems(filters: PromotedItemsFilters = {}): Promise<PromotedItem[]> {
  const supabase = await createClient();
  const { sortBy = "discount_desc" } = filters;

  const { productMap, comboMap } = await getActivePromotionDiscountMaps();

  const items: PromotedItem[] = [];

  if (productMap.size > 0) {
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
          active,
          created_at,
          updated_at,
          category:categories(id, name, slug, created_at),
          images:product_images(id, product_id, url, is_primary, sort_order)
        `,
      )
      .eq("active", true)
      .in("id", Array.from(productMap.keys()));

    if (error) {
      throw error;
    }

    for (const product of (data as unknown as Product[]) ?? []) {
      const promo = productMap.get(product.id);
      if (!promo) {
        continue;
      }

      const originalPrice = Number(product.price);
      const discountedPrice = calculateDiscountedPrice(originalPrice, promo.discount_type, promo.discount_value);

      items.push({
        type: "product",
        data: { ...product, originalPrice, discountedPrice, hasDiscount: discountedPrice < originalPrice },
      });
    }
  }

  if (comboMap.size > 0) {
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
      .eq("active", true)
      .in("id", Array.from(comboMap.keys()));

    if (error) {
      throw error;
    }

    for (const combo of (data as unknown as ComboWithItems[]) ?? []) {
      const promo = comboMap.get(combo.id);
      if (!promo) {
        continue;
      }

      const originalPrice = Number(combo.price);
      const discountedPrice = calculateDiscountedPrice(originalPrice, promo.discount_type, promo.discount_value);

      items.push({
        type: "combo",
        data: { ...combo, originalPrice, discountedPrice, hasDiscount: discountedPrice < originalPrice },
      });
    }
  }

  if (sortBy === "newest") {
    items.sort((a, b) => new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime());
  } else {
    items.sort((a, b) => {
      const discountA = a.data.originalPrice > 0 ? (a.data.originalPrice - a.data.discountedPrice) / a.data.originalPrice : 0;
      const discountB = b.data.originalPrice > 0 ? (b.data.originalPrice - b.data.discountedPrice) / b.data.originalPrice : 0;
      return discountB - discountA;
    });
  }

  return items;
}

export type ProductWithDiscount = Product & {
  originalPrice: number;
  discountedPrice: number;
  hasDiscount: boolean;
};

export async function getProductBySlug(slug: string): Promise<ProductWithDiscount | null> {
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
        active,
        created_at,
        updated_at,
        category:categories(id, name, slug, created_at),
        images:product_images(id, product_id, url, is_primary, sort_order)
      `,
    )
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const product = data as unknown as Product;
  const sortedImages = [...(product.images ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  const { productMap } = await getActivePromotionDiscountMaps();
  const originalPrice = Number(product.price);
  const promo = productMap.get(product.id);
  const discountedPrice = promo
    ? calculateDiscountedPrice(originalPrice, promo.discount_type, promo.discount_value)
    : originalPrice;

  return {
    ...product,
    images: sortedImages,
    originalPrice,
    discountedPrice,
    hasDiscount: discountedPrice < originalPrice,
  };
}

export type ComboWithDiscount = ComboWithItems & {
  originalPrice: number;
  discountedPrice: number;
  hasDiscount: boolean;
};

export async function getComboBySlug(slug: string): Promise<ComboWithDiscount | null> {
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
          product:products(id, name, slug, price, active, images:product_images(id, url, is_primary, sort_order))
        )
      `,
    )
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const combo = data as unknown as ComboWithItems;
  const { comboMap } = await getActivePromotionDiscountMaps();
  const originalPrice = Number(combo.price);
  const promo = comboMap.get(combo.id);
  const discountedPrice = promo
    ? calculateDiscountedPrice(originalPrice, promo.discount_type, promo.discount_value)
    : originalPrice;

  return {
    ...combo,
    originalPrice,
    discountedPrice,
    hasDiscount: discountedPrice < originalPrice,
  };
}

export async function getRelatedProducts(categoryId: string, excludeProductId: string, limit: number): Promise<Product[]> {
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
        active,
        created_at,
        updated_at,
        images:product_images(id, product_id, url, is_primary, sort_order)
      `,
    )
    .eq("active", true)
    .eq("category_id", categoryId)
    .neq("id", excludeProductId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data as unknown as Product[]) ?? [];
}

export async function getFeaturedCombos(limit: number): Promise<ComboWithItems[]> {
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
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data as unknown as ComboWithItems[]) ?? [];
}

export async function getFeaturedProducts(limit: number): Promise<Product[]> {
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
        active,
        created_at,
        updated_at,
        images:product_images(id, product_id, url, is_primary, sort_order)
      `,
    )
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data as unknown as Product[]) ?? [];
}

export type PromotionTargetWithPrice = {
  type: "product" | "combo";
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  originalPrice: number;
  discountedPrice: number;
};

export type ActivePromotion = PromotionWithLinks & {
  targets: PromotionTargetWithPrice[];
};

export async function getActivePromotions(limit: number): Promise<ActivePromotion[]> {
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
          product:products(id, name, slug, price, active, images:product_images(id, url, is_primary, sort_order)),
          combo:combos(id, name, slug, price, active, image_url)
        )
      `,
    )
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const promotions = (data as unknown as PromotionWithLinks[]) ?? [];

  return promotions
    .filter((promotion) => getPromotionStatus(promotion.start_date, promotion.end_date, promotion.active) === "Activa")
    .slice(0, limit)
    .map((promotion) => {
      const targets = (promotion.links ?? [])
        .map((link): PromotionTargetWithPrice | null => {
          if (link.product) {
            const images = link.product.images ?? [];
            const primaryImage = images.find((image) => image.is_primary) ?? images[0];
            const originalPrice = Number(link.product.price);

            return {
              type: "product",
              id: link.product.id,
              slug: link.product.slug,
              name: link.product.name,
              imageUrl: primaryImage?.url ?? null,
              originalPrice,
              discountedPrice: calculateDiscountedPrice(originalPrice, promotion.discount_type, promotion.discount_value),
            };
          }

          if (link.combo) {
            const originalPrice = Number(link.combo.price);

            return {
              type: "combo",
              id: link.combo.id,
              slug: link.combo.slug,
              name: link.combo.name,
              imageUrl: link.combo.image_url,
              originalPrice,
              discountedPrice: calculateDiscountedPrice(originalPrice, promotion.discount_type, promotion.discount_value),
            };
          }

          return null;
        })
        .filter((target): target is PromotionTargetWithPrice => target !== null);

      return { ...promotion, targets };
    });
}
