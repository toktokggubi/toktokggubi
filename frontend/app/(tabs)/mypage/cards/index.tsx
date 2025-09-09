// 라우트는 '무엇을 그릴지'만 결정: 더미 데이터 + 템플릿 주입
import CardCarouselTemplate from "@/features/User/templates/Card";
import { getUserCards } from "@/features/User/api/cardService";

export default function CardListRoute() {
  const cards = getUserCards(); // 지금은 더미 동기 반환
  return <CardCarouselTemplate cards={cards} />;
}
