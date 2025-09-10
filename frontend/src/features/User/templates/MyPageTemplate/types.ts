import type { ImageSourcePropType } from "react-native";

export interface MyPageTemplateProps {
  onPressCard?: () => void;
  onPressGifticon?: () => void;
  cardImage: ImageSourcePropType;
  gifticonImage: ImageSourcePropType;
}
