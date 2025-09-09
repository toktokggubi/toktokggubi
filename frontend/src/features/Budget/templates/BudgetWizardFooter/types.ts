export interface BudgetWizardFooterProps {
  stepIndex: number; // 0-based
  stepTotal: number;
  onPressPrev?: () => void;
  onPressNext?: () => void;
  nextDisabled?: boolean;
  nextTone?: "link" | "filled";
  prevTone?: "link" | "filled";
}
