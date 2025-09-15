import type { SaleEvent } from "@/features/Lucky/model/types";
import type { Merchant } from "@/features/Lucky/model/types";

export interface SaleCalendarProps {
  year: number;
  month: number; // 1-12
  events: SaleEvent[];
  merchants: Merchant[];
  selectedDay?: number | null;
  onSelectDay?: (day: number | null) => void;
  onChangeMonth?: (year: number, month: number) => void;
}
