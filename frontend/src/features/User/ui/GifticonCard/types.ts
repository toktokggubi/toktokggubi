import type { GestureResponderEvent } from "react-native";

export interface GifticonCardProps {
  imageSource: number; // require(...) 결과
  title: string;
  brand: string;
  onPress: (e: GestureResponderEvent) => void;
}
