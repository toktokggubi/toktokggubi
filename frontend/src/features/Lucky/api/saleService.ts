// src/features/Lucky/api/saleService.ts
import { z } from "zod";
import {
  MonthParams,
  MonthResult,
  saleEventSchema,
  Category,
  Merchant,
} from "@/features/Lucky/model/types";

// — 더미 상점/행사 —
const MERCHANTS: Merchant[] = [
  { id: "m_starbucks", name: "스타벅스", category: "cafe" },
  { id: "m_megacoffee", name: "메가커피", category: "cafe" },
  { id: "m_cgv", name: "CGV", category: "movie" },
];

const EVENTS = [
  {
    id: "e1",
    merchantId: "m_starbucks",
    category: "cafe" as Category,
    title: "프라푸치노 1+1",
    startDate: "2025-09-01",
    endDate: "2025-09-04",
    note: "앱 오더 한정",
  },
  {
    id: "e2",
    merchantId: "m_megacoffee",
    category: "cafe" as Category,
    title: "아메리카노 29%↓",
    startDate: "2025-09-11",
    endDate: "2025-09-11",
  },
  {
    id: "e3",
    merchantId: "m_starbucks",
    category: "cafe" as Category,
    title: "기프트카드 캐시백",
    startDate: "2025-09-22",
    endDate: "2025-09-24",
  },
];

const monthResultSchema = z.object({
  events: z.array(saleEventSchema),
  merchants: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      category: z.enum(["cafe", "movie", "shopping", "life", "burger", "etc"]),
    })
  ),
});

export async function fetchSalesByMonth(
  params: MonthParams
): Promise<MonthResult> {
  const { year, month, category } = params;

  // 더미 필터링
  const yyyy = String(year);
  const mm = String(month).padStart(2, "0");
  const events = EVENTS.filter(
    (e) =>
      e.category === category && e.startDate.slice(0, 7) === `${yyyy}-${mm}`
  );
  const merchants = MERCHANTS.filter((m) => m.category === category);

  const parsed = monthResultSchema.parse({ events, merchants });
  return parsed;
}
