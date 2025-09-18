// frontend/src/features/User/templates/GifticonsTemplate/types.ts
import type { Gifticon } from "@/features/User/model/gifticon/types";
import type { GifticonSort } from "@/features/User/ui/GifticonSortTabs/types";

export interface GifticonsTemplateProps {
  /** 화면에 실제로 표시할(검색/정렬 적용된) 데이터 */
  data: Gifticon[];
  /** 전체 보유 개수(검색/정렬 적용 전) */
  totalCount: number;

  onSelect: (item: Gifticon, index: number) => void;

  // 검색/정렬

  // 검색/정렬
  query: string;
  onQueryChange: (text: string) => void;
  onClearQuery?: () => void;
  onSubmitSearch?: (text: string) => void;
  sort: GifticonSort;
  onSortChange: (next: GifticonSort) => void;

  /** 사용자가 검색을 '시도'했는지(Submit/엔터/검색버튼) */
  hasSearched: boolean;

  // 삭제/선택
  selecting: boolean;
  onToggleSelecting: () => void;
  selectedIds: Set<string>;
  onToggleSelectItem: (item: Gifticon) => void;
  onDeleteSelected: () => void;

  // 안정적인 key를 위한 id getter
  getId: (g: Gifticon) => string;
}
