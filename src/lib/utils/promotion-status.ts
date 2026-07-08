export function getPromotionStatus(startDate: string, endDate: string, active: boolean) {
  if (!active) {
    return "Pausada";
  }

  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    return "Programada";
  }

  if (now > end) {
    return "Finalizada";
  }

  return "Activa";
}

export function calculateDiscountedPrice(
  originalPrice: number,
  discountType: "percentage" | "fixed_amount" | "2x1",
  discountValue: number | null = 0,
) {
  const basePrice = Number(originalPrice) || 0;

  switch (discountType) {
    case "percentage":
      return Math.max(basePrice - (basePrice * (Number(discountValue || 0) / 100)), 0);
    case "fixed_amount":
      return Math.max(basePrice - (Number(discountValue || 0) || 0), 0);
    case "2x1":
      return basePrice;
    default:
      return basePrice;
  }
}
