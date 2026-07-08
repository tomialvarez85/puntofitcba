export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  category_id: string | null;
  brand_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  brand?: Brand | null;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ComboItemWithProduct {
  id: string;
  combo_id: string;
  product_id: string;
  quantity: number;
  product?: Product | null;
}

export interface Combo {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComboWithItems extends Combo {
  items?: ComboItemWithProduct[];
}

export interface ComboItem {
  id: string;
  combo_id: string;
  product_id: string;
  quantity: number;
}

export interface Promotion {
  id: string;
  name: string;
  description: string | null;
  discount_type: "percentage" | "fixed_amount" | "2x1";
  discount_value: number | null;
  image_url: string | null;
  start_date: string;
  end_date: string;
  active: boolean;
  created_at: string;
}

export interface PromotionProduct {
  id: string;
  promotion_id: string;
  product_id: string | null;
  combo_id: string | null;
  product?: Product | null;
  combo?: Combo | null;
}

export interface PromotionWithLinks extends Promotion {
  links?: PromotionProduct[];
}

export interface PromotionTarget {
  id: string;
  name: string;
  type: "product" | "combo";
  price: number;
  active: boolean;
}
