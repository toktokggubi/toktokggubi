export interface GifticonRegisterTemplateProps {
  imageUri: string | null;
  onPickImage: (uri: string | null) => void;
  loading: boolean;
  onSubmit: () => void;
}
