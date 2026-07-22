import { notFound } from "next/navigation";
import PromotionForm from "@/components/admin/PromotionForm";
import { getPromotionTargets, getPromotionById } from "@/lib/data/promotions";

type EditPromotionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPromotionPage({ params }: EditPromotionPageProps) {
  const { id } = await params;
  const [promotion, targets] = await Promise.all([getPromotionById(id), getPromotionTargets()]);

  if (!promotion) {
    notFound();
  }

  return <PromotionForm initialTargets={targets} promotion={promotion} mode="edit" />;
}
