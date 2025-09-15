import { z } from "zod";
import { CATEGORY_VALUES, type Category } from "@/shared/constants/categories";
import {
  MonthParams,
  MonthResult,
  saleEventSchema,
  Merchant,
} from "@/features/Lucky/model/types";

const MERCHANTS: Merchant[] = [
  { id: "m_starbucks", name: "스타벅스", category: "cafe_snack" },
  { id: "m_megacoffee", name: "메가커피", category: "cafe_snack" },
  { id: "m_cgv", name: "CGV", category: "culture" },
];

const EVENTS = [
  {
    id: "e1",
    merchantId: "m_starbucks",
    category: "cafe_snack" as Category,
    title: "프라푸치노 1+1",
    startDate: "2025-09-01",
    endDate: "2025-09-04",
  },
  {
    id: "e2",
    merchantId: "m_megacoffee",
    category: "cafe_snack" as Category,
    title: "아메리카노 29%↓",
    startDate: "2025-09-11",
    endDate: "2025-09-11",
  },
  {
    id: "e3",
    merchantId: "m_cgv",
    category: "culture" as Category,
    title: "영화 1+1",
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
      category: z.enum(CATEGORY_VALUES),
    })
  ),
});

export async function fetchSalesByMonth(
  params: MonthParams
): Promise<MonthResult> {
  const { year, month, category } = params;
  const yyyy = String(year);
  const mm = String(month).padStart(2, "0");

  const events = EVENTS.filter(
    (e) =>
      e.category === category && e.startDate.slice(0, 7) === `${yyyy}-${mm}`
  );

  const merchants = MERCHANTS.filter((m) => m.category === category);

  return monthResultSchema.parse({ events, merchants });
}
