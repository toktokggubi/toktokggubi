export interface FixedExpenseItem {
  id: string;
  name: string;
  amount: number; // 원 단위
  includeInBudget: boolean; // "예산 포함" 체크
  billingDay?: number; // 결제일(선택)
}

export interface FixedExpenseRowProps {
  item: FixedExpenseItem;
  onPress?: (item: FixedExpenseItem) => void; // 읽기 전용 → 클릭 시 수정 모달 열기
}
