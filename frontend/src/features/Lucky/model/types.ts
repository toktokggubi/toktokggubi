import { z } from "zod";
import { CATEGORY_VALUES, type Category } from "@/shared/constants/categories";

export const categorySchema = z.enum(CATEGORY_VALUES);
export type { Category }; // 공용 타입 재노출

export interface Merchant {
  id: string;
  name: string;
  category: Category;
}

export const saleEventSchema = z.object({
  id: z.string(),
  merchantId: z.string(),
  category: categorySchema,
  title: z.string(),
  startDate: z.string(), // YYYY-MM-DD
  endDate: z.string(), // YYYY-MM-DD
  note: z.string().optional(),
});
export type SaleEvent = z.infer<typeof saleEventSchema>;

export interface MonthParams {
  year: number;
  month: number; // 1-12
  category: Category;
}

export interface MonthResult {
  events: SaleEvent[];
  merchants: Merchant[];
}
