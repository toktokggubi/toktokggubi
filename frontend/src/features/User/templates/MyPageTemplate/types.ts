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
  onPressBudgetSetup?: () => void; // 예산 설정 프로세스 테스트용
  onPressAIBudgetSetup?: () => void; // AI 추천 예산 설정 테스트용
  cardImage: ImageSourcePropType;
  gifticonImage: ImageSourcePropType;
  isLoggingOut?: boolean;
}
