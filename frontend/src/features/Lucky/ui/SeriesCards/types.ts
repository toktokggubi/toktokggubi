// src/features/Lucky/ui/SeriesCards/types.ts
import type { ImageSourcePropType } from "react-native";

export interface SeriesCardsProps {
  onPressNbbang: () => void;
  onPressMolbbang: () => void;
  nImageSource: ImageSourcePropType;
  molImageSource: ImageSourcePropType;
}
