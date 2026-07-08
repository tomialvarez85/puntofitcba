import { getBrands, getCategories } from "@/lib/data/products";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([getCategories(), getBrands()]);

  return <ProductForm initialCategories={categories} initialBrands={brands} mode="create" />;
}
