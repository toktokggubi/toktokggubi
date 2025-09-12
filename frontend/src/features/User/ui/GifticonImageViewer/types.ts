export interface GifticonImageViewerProps {
  visible: boolean;
  images: { uri?: string; source?: number }[]; // 라이브러리 포맷
  index: number;
  onRequestClose: () => void;
}
