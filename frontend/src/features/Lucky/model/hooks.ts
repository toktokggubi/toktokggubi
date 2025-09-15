// src/features/Lucky/model/hooks.ts
import { useQuery } from "@tanstack/react-query";
import { fetchSalesByMonth } from "@/features/Lucky/api/saleService";
import { saleKeys } from "./queryKeys";
import type { Category } from "./types";

export function useSalesByMonth(
  year: number,
  month: number,
  category: Category
) {
  return useQuery({
    queryKey: saleKeys.month(year, month, category),
    queryFn: () => fetchSalesByMonth({ year, month, category }),
  });
}
