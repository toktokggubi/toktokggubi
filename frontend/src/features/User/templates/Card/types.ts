import type { UserCard as _UserCard } from "~features/User/screens/MyPage/types.js";

export type UserCard = _UserCard; // re-export 해서 index.tsx에서 import 가능하게

export interface CardCarouselTemplateProps {
  cards: UserCard[];
}
