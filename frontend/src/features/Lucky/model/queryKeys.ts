import type { Category } from "./types";

export const saleKeys = {
  root: ["lucky", "sales"] as const,
  month: (y: number, m: number, c: Category) =>
    [...saleKeys.root, "month", y, m, c] as const,
  period: (startDate: string, endDate: string, franchiseId?: number) =>
    [...saleKeys.root, "period", startDate, endDate, franchiseId] as const,
};
