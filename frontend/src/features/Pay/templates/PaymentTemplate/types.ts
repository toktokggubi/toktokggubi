import type { ReactNode } from "react";
import type { UserCard } from "@/features/User/screens/MyPageScreen/types";
import type { Gifticon } from "@/shared/types/gifticon";
import type { RefreshControlProps } from "react-native";

export interface PaymentTemplateProps {
  selectedTab: number; // 현재 탭 인덱스
  onChangeTab: (index: number) => void;
  children?: ReactNode; // 각 탭에서 보여줄 뷰
  // 카드 관련 props
  cards?: UserCard[];
  activeCardIndex?: number;
  onActiveCardChange?: (index: number, userCardId: number) => void;
  benefitsSection?: React.ReactNode;
  cardTopSection?: React.ReactNode;
  cardBottomSection?: React.ReactNode;

  gifticons?: Gifticon[];
  activeGifticonIndex?: number;
  onActiveGifticonChange?: (index: number, gifticonId: number) => void;
  gifticonTopSection?: ReactNode;
  gifticonBottomSection?: ReactNode;
  
  // Pull-to-Refresh 관련 props
  refreshControl?: React.ReactElement<RefreshControlProps>;
}
