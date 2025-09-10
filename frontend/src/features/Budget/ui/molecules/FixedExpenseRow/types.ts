// 이 컴포넌트에서 쓰는 로컬 타입 (도메인 공용 파일 없이 사용)
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
