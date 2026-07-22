import { getPromotionTargets } from "@/lib/data/promotions";
import PromotionForm from "@/components/admin/PromotionForm";

export default async function NewPromotionPage() {
  const targets = await getPromotionTargets();

  return <PromotionForm initialTargets={targets} mode="create" />;
}
