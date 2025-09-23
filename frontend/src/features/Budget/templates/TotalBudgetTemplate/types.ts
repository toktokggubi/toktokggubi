export interface TotalBudgetTemplateProps {
  amount: number;
  onChangeAmount: (v: number) => void;

  // wizard footer actions
  onPressPrev: () => void;
  onPressNext: () => void;
  nextDisabled?: boolean;

  // slider range
  min?: number;
  max?: number;
  step?: number;
}
