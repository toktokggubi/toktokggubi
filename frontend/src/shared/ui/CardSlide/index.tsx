// shared/ui/CardSlide/index.tsx
import { font } from "@/shared/typography/font";
import React, { memo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { CardSlideProps } from "./types";
import { 
  DEFAULT_CARD_IMAGE, 
  CARD_IMAGE_BY_ISSUER 
} from "@/features/User/screens/MyPageScreen/types";

function CardSlideImpl({ card }: CardSlideProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  // 1) 서버 imageUrl 우선 → 2) 카드사별 정적 이미지 → 3) 기본 이미지
  const fallbackSource = (card.cardIssuerCode && CARD_IMAGE_BY_ISSUER[card.cardIssuerCode])
    ? CARD_IMAGE_BY_ISSUER[card.cardIssuerCode]
    : DEFAULT_CARD_IMAGE;
    
  const source = card.imageUrl && !imageError
    ? { uri: card.imageUrl } // 이미 절대 URL로 변환됨
    : fallbackSource;


  return (
    <View style={s.wrap}>
      {/* 카드 이미지만 표시 */}
      <Image 
        source={source} 
        style={s.cardImg}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
        onLoad={() => {
          setImageError(false);
          setImageLoading(false);
        }}
      />
      {imageLoading && (
        <View style={s.loadingOverlay}>
          <Text style={s.loadingText}>로딩 중...</Text>
        </View>
      )}
      {imageError && (
        <Text style={s.errorText}>이미지 로딩 실패</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { 
    alignItems: "center", 
    width: "100%",
    justifyContent: "center",
  },
  cardImg: {
    width: "85%",
    height: 250,
    borderRadius: 12,
    resizeMode: "contain",
    marginTop: 12,
    alignSelf: "center",
  },
  loadingOverlay: {
    position: "absolute",
    top: 12,
    left: "7.5%",
    right: "7.5%",
    height: 250,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#666",
    fontSize: 12,
    ...font.medium,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
    ...font.medium,
  },
});

export default memo(CardSlideImpl);
