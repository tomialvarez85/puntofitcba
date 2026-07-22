import { notFound } from "next/navigation";
import { getActiveProducts, getComboById } from "@/lib/data/combos";
import ComboForm from "@/components/admin/ComboForm";

type EditComboPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditComboPage({ params }: EditComboPageProps) {
  const { id } = await params;
  const [combo, products] = await Promise.all([getComboById(id), getActiveProducts()]);

  if (!combo) {
    notFound();
  }

  return <ComboForm initialProducts={products} mode="edit" combo={combo} />;
}
