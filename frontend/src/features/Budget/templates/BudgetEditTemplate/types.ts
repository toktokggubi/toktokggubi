export interface CategoryBudgetItem {
  name: string;
  amount: number;
}

export interface FixedExpenseItem {
  id: string;
  name: string;
  amount: number;
  includeInBudget: boolean;
  billingDay?: number;
}

export interface CategoryBudgetItem {
  name: string;
  amount: number;
}

export interface FixedExpenseItem {
  id: string;
  name: string;
  amount: number;
  includeInBudget: boolean;
  billingDay?: number;
}

export interface BudgetEditTemplateProps {
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
  /** 총 예산 변경 */
  onTotalBudgetChange: (amount: number) => void;
  /** 변동 지출 예산 변경 */
  onVariableBudgetChange: (amount: number) => void;
  /** 카테고리별 예산 변경 */
  onCategoryBudgetChange: (name: string, amount: number) => void;
  /** 고정 지출 추가 */
  onAddFixedExpense: () => void;
  /** 고정 지출 편집 */
  onEditFixedExpense: (item: FixedExpenseItem) => void;
  /** 고정 지출 삭제 */
  onDeleteFixedExpense: (id: string) => void;
  /** 취소 버튼 클릭 */
  onPressCancel: () => void;
  /** 수정 완료 버튼 클릭 */
  onPressSave: () => void;
  /** 수정 완료 버튼 활성화 여부 */
  saveDisabled?: boolean;
  /** 템플릿 모드 (기본값: 'edit') */
  mode?: 'edit' | 'ai-setup';
  /** 저장 버튼 텍스트 (기본값: '수정 완료') */
  saveButtonText?: string;
  /** AI 추천 데이터 (ai-setup 모드에서 사용) */
  aiRecommendations?: any; // AIRecommendationData 타입
}
