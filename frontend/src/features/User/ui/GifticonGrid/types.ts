import type { Gifticon } from "@/features/User/model/gifticon/types";

export interface GifticonGridProps {
  data: Gifticon[];
  onSelect: (item: Gifticon, index: number) => void;
}
