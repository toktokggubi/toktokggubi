import type { CategoryName } from "@/shared/constants/categoryIcons";
import type { ImageSourcePropType } from "react-native";

export interface CategoryBudgetItem {
  name: CategoryName;
  amount: number;
}

export interface FixedExpenseItem {
  id: string;
  name: string;
  amount: number;
  includeInBudget: boolean;
  billingDay?: number;
}

export interface BudgetSummaryTemplateProps {
  /** 현재 월 (예: "8월") */
  month: string;
  /** 총 예산 */
  totalBudget: number;
  /** 변동 지출 예산 */
  variableBudget: number;
  /** 고정 지출 (예산 포함) */
  fixedIncludedBudget: number;
  /** 고정 지출 (예산 미포함) */
  fixedExcludedBudget: number;
  /** 카테고리별 예산 목록 */
  categoryBudgets: CategoryBudgetItem[];
  /** 고정 지출 목록 (예산 포함) */
  fixedIncludedExpenses: FixedExpenseItem[];
  /** 고정 지출 목록 (예산 미포함) */
  fixedExcludedExpenses: FixedExpenseItem[];
  /** 이전 버튼 클릭 */
  onPressPrev: () => void;
  /** 다음 버튼 클릭 */
  onPressNext: () => void;
  /** 현재 단계 */
  stepIndex: number;
  /** 전체 단계 */
  stepTotal: number;
  /** 다음 버튼 텍스트 */
  nextLabel?: string;
}
