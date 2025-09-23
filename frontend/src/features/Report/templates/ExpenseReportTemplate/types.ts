// frontend/src/features/Report/templates/ExpenseReportTemplate/types.ts
import type { AnomalyData } from "../../ui/AnomalyMap/types";
import type { DonutChartData } from "../../ui/ExpenseDonutChart/types";

export interface DailyPaymentData {
  date: string; // "9.1", "9.5" 형태
  count: number;
}

export interface PaymentDetail {
  id: string;
  store: string;
  category: string;
  paymentMethod: string;
  amount: number;
}

export interface VIPStore {
  id: string;
  name: string;
  visitCount: number;
  totalAmount: number;
}

export interface ExpenseReportTemplateProps {
  // 헤더 데이터
  year: number;
  month: number;
  totalAmount: number;
  summaryText: string;

  // 차트 데이터
  chartData: DonutChartData[];

  // 카테고리 리스트 데이터
  categoryData: DonutChartData[];
  onCategoryPress: (category: string) => void;

  // 결제 내역 데이터
  dailyPaymentData: DailyPaymentData[];
  maxPaymentDay: string;
  maxPaymentDayDetails: PaymentDetail[];
  onMoreDetailsPress: () => void;

  // VIP 매장 데이터
  vipStores: VIPStore[];
  onVIPStorePress: (storeName: string) => void;

  // 이상탐지 데이터
  anomalyData?: AnomalyData[];
  totalAnomalyAmount?: number;

  // 알림 아이콘
  onNotificationPress?: () => void;
}
