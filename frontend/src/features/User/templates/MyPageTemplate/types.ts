import type { ImageSourcePropType } from "react-native";

export interface MyPageTemplateProps {
  onPressCard?: () => void;
  onPressGifticon?: () => void;
  // 임시 props - 나중에 제거 예정
  onPressLogin?: () => void;
  onPressBudget?: () => void;
  cardImage: ImageSourcePropType;
  gifticonImage: ImageSourcePropType;
}
