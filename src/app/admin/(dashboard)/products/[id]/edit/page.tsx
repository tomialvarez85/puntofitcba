import { notFound } from "next/navigation";
import { getBrands, getCategories, getProductById } from "@/lib/data/products";
import ProductForm from "@/components/admin/ProductForm";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories, brands] = await Promise.all([getProductById(id), getCategories(), getBrands()]);

  if (!product) {
    notFound();
  }

  return <ProductForm initialCategories={categories} initialBrands={brands} product={product} mode="edit" />;
}
