// frontend/src/features/User/ui/GifticonGrid/types.ts
import type { Gifticon } from "@/features/User/model/gifticon/types";
import type { ComponentType, ReactElement } from "react";

// FlatList가 기대하는 타입과 일치시킵니다.
type EmptyComp = ComponentType<any> | ReactElement | null;

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

  /** 데이터가 없을 때 보여줄 컴포넌트 (FlatList와 동일 타입) */
  ListEmptyComponent?: EmptyComp;
}
