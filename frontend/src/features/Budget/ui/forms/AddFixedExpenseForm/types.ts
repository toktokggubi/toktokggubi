export type FixedExpenseFormMode = "create" | "edit";

export interface AddFixedExpenseFormValues {
  name: string;
  amount: number;
  includeInBudget: boolean;
  billingDay?: number;
}

export interface AddFixedExpenseFormProps {
  mode?: FixedExpenseFormMode; // 기본 create
  defaultValues?: Partial<AddFixedExpenseFormValues>;
  onSubmit: (v: AddFixedExpenseFormValues) => void;
  onCancel?: () => void;
}
