// src/features/Lucky/model/hooks.ts
import { useQuery } from "@tanstack/react-query";
import { fetchSalesByMonth, fetchSalesByPeriod } from "@/features/Lucky/api/saleService";
import { saleKeys } from "./queryKeys";
import type { Category } from "./types";

// 기간별 API 타입 정의
interface PeriodParams {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  franchiseId?: number;
}

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

export function useSalesByPeriod(params: PeriodParams) {
  return useQuery({
    queryKey: saleKeys.period(params.startDate, params.endDate, params.franchiseId),
    queryFn: () => fetchSalesByPeriod(params),
  });
}
