export interface GifticonRegisterTemplateProps {
  imageUri: string | null;
  onPickImage: (uri: string | null) => void;
  loadingPreview: boolean;

  merchant: string;
  onMerchantChange: (t: string) => void;
  label: string;
  onLabelChange: (t: string) => void;
  expiresAt: string;
  onExpiresAtChange: (t: string) => void;

  onSubmit: () => void;
  saving: boolean;
}
