// src/features/User/ui/GifticonCard/types.ts
import type { GestureResponderEvent } from "react-native";

export interface GifticonCardProps {
  imageUrl: string; // ✅ 서버에서 받은 이미지 URL
  title: string;
  brand: string;
  expiresAt: string; // ✅ 만료일 (ISO date string)
  onPress: (e: GestureResponderEvent) => void;
}
