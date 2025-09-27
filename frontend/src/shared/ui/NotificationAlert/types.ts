// src/shared/ui/NotificationAlert/types.ts
export interface NotificationAlertProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
}
