import { notFound } from "next/navigation";
import BrandForm from "@/components/admin/BrandForm";
import { getBrandById } from "@/lib/data/brands";

type EditBrandPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBrandPage({ params }: EditBrandPageProps) {
  const { id } = await params;
  const brand = await getBrandById(id);

  if (!brand) {
    notFound();
  }

  return <BrandForm brand={brand} mode="edit" />;
}
