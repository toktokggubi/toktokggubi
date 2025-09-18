import type { Gifticon } from "@/features/User/model/gifticon/types";
import type { GifticonSort } from "@/features/User/ui/GifticonSortTabs/types";

export interface GifticonsTemplateProps {
  data: Gifticon[];
  onSelect: (item: Gifticon, index: number) => void;
  query: string;
  onQueryChange: (text: string) => void;
  onClearQuery?: () => void;
  sort: GifticonSort;
  onSortChange: (next: GifticonSort) => void;
  onSubmitSearch?: (text: string) => void;
}
