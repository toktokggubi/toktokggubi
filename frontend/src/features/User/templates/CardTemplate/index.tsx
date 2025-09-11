// src/features/User/templates/Card/index.tsx
import React, { useEffect, useRef } from "react";
import { View, Dimensions, StyleSheet, Text } from "react-native";
import Carousel from "react-native-snap-carousel";
import type { CardCarouselTemplateProps, UserCard } from "./types";
import CardSlide from "@/shared/ui/CardSlide";
import PagerDots from "@/features/User/ui/PagerDots";

const { width: SCREEN_W } = Dimensions.get("window");
const ITEM_W = Math.round(SCREEN_W * 0.68);

export default function CardCarouselTemplate({
  cards,
  activeIndex,
  onActiveChange,
}: CardCarouselTemplateProps) {
  const carouselRef = useRef<Carousel<UserCard> | null>(null);

  // 부모가 activeIndex를 바꾸면 해당 위치로 스냅
  useEffect(() => {
    if (!carouselRef.current) return;
    // 데이터가 비었거나 인덱스가 범위를 벗어나면 무시
    if (cards.length === 0) return;
    const clamped = Math.max(0, Math.min(activeIndex, cards.length - 1));
    // 부드러운 스냅 (애니메이션 false면 즉시 이동)
    carouselRef.current.snapToItem(clamped, false);
  }, [activeIndex, cards.length]);

  // 데이터 길이가 줄어들었을 때(삭제 등), 현재 인덱스가 범위를 벗어나지 않도록 보정 요청
  useEffect(() => {
    if (cards.length === 0) {
      // 부모가 0 상태를 적절히 그려줄 수 있도록 인덱스를 0으로 유지
      onActiveChange(0);
    } else if (activeIndex > cards.length - 1) {
      onActiveChange(cards.length - 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length]);

  const renderCard = ({ item }: { item: UserCard; index: number }) => {
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
        sliderWidth={SCREEN_W}
        itemWidth={ITEM_W}
        inactiveSlideScale={0.92}
        inactiveSlideOpacity={1}
        activeSlideAlignment="center"
        vertical={false}
        // 스와이프해서 바뀔 때 부모에 알려줌
        onSnapToItem={onActiveChange}
        // 키 추출: id가 있으면 사용, 없으면 index로 폴백
        keyExtractor={(item, index) =>
          // @ts-expect-error: UserCard에 id가 없을 수도 있어 안전 폴백
          (item.id as string | undefined) ?? String(index)
        }
      />
      <PagerDots length={cards.length} activeIndex={activeIndex} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8FBFF", paddingTop: 20 },
  empty: { alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#64748b", fontSize: 14, fontWeight: "600" },
});
