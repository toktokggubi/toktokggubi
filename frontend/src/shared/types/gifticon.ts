import { ImageSourcePropType } from "react-native";

export interface Gifticon {
  gifticonId: number;
  label: string;
  merchantId: number;
  merchantName: string;
  categoryId: number;
  categoryName: string;
  imageUrl: string;
  imageSource?: ImageSourcePropType;
  expiresAt: string; // "2025-09-20"
  remainingDays: number; // 11
  status: "ACTIVE" | "USED" | "EXPIRED";
  createdAt: string;
}
