// frontend/src/features/Report/ui/ExpenseDonutChart/types.ts
export interface DonutChartData {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

export interface ExpenseDonutChartProps {
  data: DonutChartData[];
  size?: number;
  strokeWidth?: number;
  showCenterText?: boolean;
  centerText?: string;
}
