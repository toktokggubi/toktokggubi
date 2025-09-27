import type { ImageSourcePropType } from "react-native";

export interface UserInfo {
  nickname: string;
  monthlyIncome: number;
  jobTitle: string;
}

export interface MyPageTemplateProps {
  userInfo?: UserInfo;
  onPressCard?: () => void;
  onPressGifticon?: () => void;
  onPressLogout?: () => void;
  onPressSettings?: () => void;
  onPressProfileEdit?: () => void;
  cardImage: ImageSourcePropType;
  gifticonImage: ImageSourcePropType;
  isLoggingOut?: boolean;
}
