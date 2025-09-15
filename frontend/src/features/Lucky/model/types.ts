// src/features/Lucky/model/types.ts
import { z } from "zod";

export const categorySchema = z.enum([
  "cafe",
  "movie",
  "shopping",
  "life",
  "burger",
  "etc",
]);
export type Category = z.infer<typeof categorySchema>;

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
  startDate: z.string(), // ISO (YYYY-MM-DD)
  endDate: z.string(), // ISO
  note: z.string().optional(),
});
export type SaleEvent = z.infer<typeof saleEventSchema>;

export interface MonthParams {
  year: number; // e.g., 2025
  month: number; // 1-12
  category: Category;
}

export interface MonthResult {
  events: SaleEvent[];
  merchants: Merchant[];
}
