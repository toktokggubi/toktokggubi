// src/shared/ui/MolbbangAlert/types.ts
export interface MolbbangAlertProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  type?: "default" | "success" | "error" | "warning";
}
