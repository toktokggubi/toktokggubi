// src/features/User/templates/Card/types.ts
import type { UserCard } from "@/features/User/screens/MyPageScreen/types";

export interface CardCarouselTemplateProps {
  cards: UserCard[];
  activeIndex: number;
  onActiveChange: (index: number) => void;
}

export type { UserCard };
