"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS: { value: "discount_desc" | "newest"; label: string }[] = [
  { value: "discount_desc", label: "Mayor descuento" },
  { value: "newest", label: "Más recientes" },
];

export default function PromotionsSortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSort = searchParams.get("orden") ?? "discount_desc";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "discount_desc") {
      params.delete("orden");
    } else {
      params.set("orden", value);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <select
      value={activeSort}
      onChange={(event) => handleChange(event.target.value)}
      className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 outline-none"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
