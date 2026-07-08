import { getActiveProducts } from "@/lib/data/combos";
import ComboForm from "@/components/admin/ComboForm";

export default async function NewComboPage() {
  const products = await getActiveProducts();

  return <ComboForm initialProducts={products} mode="create" />;
}
