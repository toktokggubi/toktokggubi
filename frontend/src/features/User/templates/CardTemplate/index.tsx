// src/features/User/templates/Card/index.tsx
import { useCardBenefits } from "@/features/User/model/benefit/hooks";
import BenefitsList from "@/features/User/ui/BenefitsList";
import PagerDots from "@/features/User/ui/PagerDots";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import CardSlide from "@/shared/ui/CardSlide";
import React, { useEffect, useRef } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import type { CardCarouselTemplateProps, UserCard } from "./types";

const { width: SCREEN_W } = Dimensions.get("window");
const ITEM_W = Math.round(SCREEN_W * 0.68);

export default function CardCarouselTemplate({
  cards,
  activeIndex,
  onActiveChange,
}: CardCarouselTemplateProps) {
  const carouselRef = useRef<Carousel<UserCard> | null>(null);

  const activeCard = cards[activeIndex];
  const activeUserCardId = activeCard?.userCardId ?? -1;

  const { data, isLoading, isError } = useCardBenefits(activeUserCardId);

  useEffect(() => {
    if (!carouselRef.current || cards.length === 0) return;
    const clamped = Math.max(0, Math.min(activeIndex, cards.length - 1));
    carouselRef.current.scrollTo({ index: clamped, animated: false });
  }, [activeIndex, cards.length]);

  useEffect(() => {
    if (cards.length === 0) onActiveChange(0);
    else if (activeIndex > cards.length - 1) onActiveChange(cards.length - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length]);

  const renderCard = ({ item }: { item: UserCard }) => {
    return <CardSlide card={item} />;
  };

  if (cards.length === 0) {
    return (
      <View style={[styles.root, styles.empty]}>
        <Text style={styles.emptyText}>등록된 카드가 없어요</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Carousel<UserCard>
        ref={carouselRef}
        data={cards}
        renderItem={renderCard}
        width={SCREEN_W}
        height={ITEM_W * 0.6}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        onSnapToItem={onActiveChange}
        keyExtractor={(item, index) =>
          // @ts-expect-error: UserCard에 id가 없을 수도 있어 폴백
          (item.id as string | undefined) ?? String(index)
        }
        style={styles.carouselContainer}
      />

      <View style={styles.dotsWrapper}>
        <PagerDots length={cards.length} activeIndex={activeIndex} top={20} />
      </View>

      {isLoading ? (
        <View style={styles.benefitLoadingWrapper}>
          <Text style={styles.benefitLoadingText}>혜택 불러오는 중...</Text>
        </View>
      ) : isError ? (
        <View style={styles.benefitErrorWrapper}>
          <Text style={styles.benefitErrorText}>혜택을 가져오지 못했어요</Text>
        </View>
      ) : (
        <BenefitsList benefits={data?.benefits ?? []} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.BACKGROUND_PRIMARY, paddingTop: 20 },
  empty: { alignItems: "center", justifyContent: "center" },
  emptyText: { color: colors.GRAY_NORMAL, fontSize: 14, ...font.medium },

  // 캐러셀이 콘텐츠 높이만 차지하도록
  carouselContainer: { flex: 0, flexGrow: 0, alignSelf: "stretch" },
  dotsWrapper: { marginBottom: 16 },

  // ✅ 로딩/에러 스타일 분리
  benefitLoadingWrapper: { marginTop: 16, marginHorizontal: 16 },
  benefitLoadingText: { color: colors.GRAY_NORMAL },
  benefitErrorWrapper: { marginTop: 16, marginHorizontal: 16 },
  benefitErrorText: { color: "tomato" },
});
