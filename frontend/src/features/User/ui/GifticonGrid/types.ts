// src/features/User/ui/GifticonGrid/types.ts
import type { Gifticon } from "@/features/User/model/gifticon/types";

export interface GifticonGridProps {
  data: Gifticon[];
  onSelect: (item: Gifticon, index: number) => void;

  /** 선택 모드 (옵셔널) */
  isSelecting?: boolean;
  selectedIds?: Set<string>;
  onToggleSelectItem?: (item: Gifticon) => void;

  /** 안정적인 key 생성을 위한 getter (옵셔널) */
  getId?: (g: Gifticon) => string;
  extraBottomPadding?: number;
}
