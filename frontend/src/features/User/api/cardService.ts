import {
  UserCard,
  CARD_IMAGE_BY_ISSUER,
  DEFAULT_CARD_IMAGE,
} from "~features/User/screens/MyPage/types";

export function getUserCards(): UserCard[] {
  // 여기서는 서버 응답을 가정해서 issuerCode만 넣고,
  // 이미지 필드는 매퍼로 채운다.
  const raw = [
    {
      userCardId: 101,
      cardName: "국민 청춘카드",
      cardIssuerCode: "KB",
      last4: "1234",
      isActive: true,
    },
    {
      userCardId: 202,
      cardName: "삼성 탭탭오",
      cardIssuerCode: "SS",
      last4: "5678",
      isActive: false,
    },
    {
      userCardId: 303,
      cardName: "신한 Deep",
      cardIssuerCode: "SH",
      last4: "9999",
      isActive: true,
    },
  ] as const;

  return raw.map((c) => ({
    ...c,
    image: CARD_IMAGE_BY_ISSUER[c.cardIssuerCode] ?? DEFAULT_CARD_IMAGE,
  }));
}
