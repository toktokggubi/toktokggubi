import type { ReactNode } from "react";
import type { UserCardVM } from "@/features/User/model/card/types";
import type { Gifticon } from "@/shared/types/gifticon";
import type { RefreshControlProps } from "react-native";

export interface PaymentTemplateProps {
  selectedTab: number; // 현재 탭 인덱스
  onChangeTab: (index: number) => void;
  // 카드 관련 props
  cards?: UserCardVM[];
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
