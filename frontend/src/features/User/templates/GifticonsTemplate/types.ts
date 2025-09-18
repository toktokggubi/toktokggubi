// src/features/User/templates/GifticonsTemplate/types.ts
import type { Gifticon } from "@/features/User/model/gifticon/types";
import type { GifticonSort } from "@/features/User/ui/GifticonSortTabs/types";

export interface GifticonsTemplateProps {
  data: Gifticon[];
  onSelect: (item: Gifticon, index: number) => void;

  // 검색/정렬
  query: string;
  onQueryChange: (text: string) => void;
  onClearQuery?: () => void;
  sort: GifticonSort;
  onSortChange: (next: GifticonSort) => void;
  onSubmitSearch?: (text: string) => void;

  // 삭제/선택
  selecting: boolean;
  onToggleSelecting: () => void;
  selectedIds: Set<string>;
  onToggleSelectItem: (item: Gifticon) => void;
  onDeleteSelected: () => void;

  // 안정적인 key를 위한 id getter
  getId: (g: Gifticon) => string;
}
