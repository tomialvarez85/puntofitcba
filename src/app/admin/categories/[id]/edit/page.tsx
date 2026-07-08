import { notFound } from "next/navigation";
import CategoryForm from "@/components/admin/CategoryForm";
import { getCategoryById } from "@/lib/data/categories";

type EditCategoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  return <CategoryForm category={category} mode="edit" />;
}
