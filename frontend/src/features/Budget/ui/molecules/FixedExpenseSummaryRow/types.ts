import type { FixedExpenseItem } from "~features/Budget/ui/molecules/FixedExpenseRow/types";

export interface FixedExpenseSummaryRowProps {
  item: FixedExpenseItem;
  onPress?: (item: FixedExpenseItem) => void;
}
