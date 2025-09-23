// frontend/src/features/Report/ui/PaymentLineChart/types.ts
export interface DailyPaymentData {
  date: string; // "9.1", "9.5" 형태
  count: number;
}

export interface PaymentLineChartProps {
  data: DailyPaymentData[];
  maxCount: number;
}
