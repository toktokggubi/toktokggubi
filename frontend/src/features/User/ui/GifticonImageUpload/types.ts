export interface GifticonImageUploadProps {
  value: string | null; // 로컬 이미지 URI
  onChange: (uri: string | null) => void;
  loading?: boolean;
}
