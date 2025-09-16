export interface GifticonFormProps {
  merchant: string;
  onMerchantChange: (t: string) => void;
  label: string;
  onLabelChange: (t: string) => void;
  expiresAt: string; // YYYY-MM-DD
  onExpiresAtChange: (t: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}
