// shared/ui/CardSlide/index.tsx
import { font } from "@/shared/typography/font";
import React, { memo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { CardSlideProps } from "./types";

// 레거시 매핑(폴백) — 기존 위치 유지
import {
  CARD_IMAGE_BY_ISSUER,
  DEFAULT_CARD_IMAGE,
} from "@/features/User/screens/MyPageScreen/types";

function CardSlideImpl({ card }: CardSlideProps) {
  // 1) 서버 image 우선 → 2) 과거 issuerCode 매핑 → 3) 기본 이미지
  const source =
    card.image ??
    (card.cardIssuerCode && CARD_IMAGE_BY_ISSUER[card.cardIssuerCode]
      ? CARD_IMAGE_BY_ISSUER[card.cardIssuerCode]
      : undefined) ??
    DEFAULT_CARD_IMAGE;

  return (
    <View style={s.wrap}>
      <Image source={source} style={s.cardImg} />
      <Text style={s.name}>{card.cardName || "카드명 없음"}</Text>
      <Text style={s.sub}>**** **** **** {card.last4 || "0000"}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: "center", width: "100%" },
  cardImg: {
    width: "100%",
    height: 280,
    borderRadius: 12,
    resizeMode: "contain",
    marginBottom: 12,
    marginTop: 12,
  },
  name: { fontSize: 16, ...font.bold },
  sub: { marginTop: 4, color: "#6b7280" },
});

export default memo(CardSlideImpl);
