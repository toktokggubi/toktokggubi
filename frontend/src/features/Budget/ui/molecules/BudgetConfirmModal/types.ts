export interface BudgetConfirmModalProps {
  visible: boolean;
  month: string;
  totalBudget: number;
  onConfirm: () => void;
  onCancel: () => void;
}
