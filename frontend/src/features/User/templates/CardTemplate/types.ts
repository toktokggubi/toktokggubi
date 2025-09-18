import type { UserCardVM } from "@/features/User/model/card/types";

export interface CardCarouselTemplateProps {
  cards: UserCardVM[];
  activeIndex: number;
  onActiveChange: (idx: number) => void;
}

export type UserCard = UserCardVM;
