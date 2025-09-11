import type { ReactNode } from "react";
import type { UserCard } from "@/features/User/screens/MyPageScreen/types";

export interface PaymentTemplateProps {
  selectedTab: number; // 현재 탭 인덱스
  onChangeTab: (index: number) => void;
  children?: ReactNode; // 각 탭에서 보여줄 뷰
  // 카드 관련 props
  cards?: UserCard[];
  activeCardIndex?: number;
  onActiveCardChange?: (index: number) => void;
}
