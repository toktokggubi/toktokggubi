// src/features/User/ui/GifticonCard/types.ts
import type { GestureResponderEvent, ImageSourcePropType } from "react-native";

export interface GifticonCardProps {
  imageSource: ImageSourcePropType; // ✅ 로컬/네트워크 둘 다 가능
  title: string;
  brand: string;
  onPress: (e: GestureResponderEvent) => void;
  /** 남은 일수. 17이면 D-17, 0이면 D-DAY, 음수면 D+표시 */
  dDay?: number;
}
