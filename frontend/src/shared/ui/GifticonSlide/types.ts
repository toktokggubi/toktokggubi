// src/shared/ui/GifticonSlide/types.ts
import type { Gifticon } from "@/shared/types/gifticon";

export type GifticonCard = Pick<
  Gifticon,
  | "gifticonId"
  | "label"
  | "merchantName"
  | "imageUrl"
  | "imageSource"
  | "expiresAt"
  | "remainingDays"
  | "status"
>;
