import type { FixedExpenseItem } from "~features/Budget/ui/molecules/FixedExpenseRow/types";

export interface FixedExpenseListProps {
  items: FixedExpenseItem[];
  onPressItem?: (item: FixedExpenseItem) => void; // 행 클릭 → 수정 폼 열기
  onPressAdd?: () => void; // + 클릭 → 추가 폼 열기
  showHeader?: boolean; // 기본 true
}
