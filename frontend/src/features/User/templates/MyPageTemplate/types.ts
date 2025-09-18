import type { ImageSourcePropType } from "react-native";

export interface MyPageTemplateProps {
  onPressCard?: () => void;
  onPressGifticon?: () => void;
  onPressLogout?: () => void;
  cardImage: ImageSourcePropType;
  gifticonImage: ImageSourcePropType;
  isLoggingOut?: boolean;
}
