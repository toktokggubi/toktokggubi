// src/features/User/templates/Card/index.tsx
import { useCardBenefits } from "@/features/User/model/benefit/hooks";
import BenefitsList from "@/features/User/ui/BenefitsList";
import PagerDots from "@/features/User/ui/PagerDots";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import CardSlide from "@/shared/ui/CardSlide";
import React, { useEffect, useRef } from "react";
import { Dimensions, StyleSheet, Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Carousel from "react-native-snap-carousel";
import type { CardCarouselTemplateProps, UserCard } from "./types";

const { width: SCREEN_W } = Dimensions.get("window");
const ITEM_W = Math.round(SCREEN_W * 0.68);

export default function CardCarouselTemplate({
  cards,
  activeIndex,
  onActiveChange,
}: CardCarouselTemplateProps) {
  const carouselRef = useRef<Carousel<UserCard> | null>(null);

  const activeCard = cards?.[activeIndex];
  const activeUserCardId = activeCard?.userCardId ?? -1;


  const { data, isLoading, isError } = useCardBenefits(activeUserCardId);

  useEffect(() => {
    if (!carouselRef.current || !cards || cards.length === 0) return;
    const clamped = Math.max(0, Math.min(activeIndex, cards.length - 1));
    carouselRef.current.snapToItem(clamped, false);
  }, [activeIndex, cards.length]);

  useEffect(() => {
    if (!cards || cards.length === 0) {
      onActiveChange(0);
    } else if (activeIndex > cards.length - 1) {
      onActiveChange(Math.max(0, cards.length - 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards?.length]);

  const renderCard = ({ item }: { item: UserCard; index: number }) => {
    return <CardSlide card={item} />;
  };

  if (!cards || cards.length === 0) {
    return (
      <SafeAreaView style={[styles.root, styles.empty]} edges={['bottom']}>
        <Text style={styles.emptyText}>등록된 카드가 없어요</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      {/* 카드 캐러셀 - 고정 높이 */}
      <View style={styles.carouselSection}>
        <Carousel<UserCard>
          ref={carouselRef}
          data={cards || []}
          renderItem={renderCard}
          sliderWidth={SCREEN_W}
          itemWidth={ITEM_W}
          inactiveSlideScale={0.92}
          inactiveSlideOpacity={1}
          activeSlideAlignment="center"
          vertical={false}
          onSnapToItem={onActiveChange}
          keyExtractor={(item, index) => String(item.userCardId ?? index)}
          containerCustomStyle={styles.carouselContainer}
        />

        <View style={styles.dotsWrapper}>
          <PagerDots length={cards?.length || 0} activeIndex={activeIndex} top={20} />
        </View>
      </View>

      {/* 혜택 안내 - 고정 높이로 스크롤 가능 */}
      <View style={styles.benefitsSection}>
        {isLoading ? (
          <View style={styles.benefitLoadingWrapper}>
            <Text style={styles.benefitLoadingText}>혜택 불러오는 중...</Text>
          </View>
        ) : isError ? (
          <View style={styles.benefitErrorWrapper}>
            <Text style={styles.benefitErrorText}>혜택을 가져오지 못했어요</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.benefitsScrollView}
            showsVerticalScrollIndicator={true}
            bounces={false}
          >
            <BenefitsList benefits={data?.benefits ?? []} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: colors.BACKGROUND_PRIMARY, 
    paddingTop: 20 
  },
  empty: { 
    alignItems: "center", 
    justifyContent: "center" 
  },
  emptyText: { 
    color: colors.GRAY_NORMAL, 
    fontSize: 14, 
    ...font.medium 
  },

  // 카드 캐러셀 섹션 - 고정 높이
  carouselSection: {
    height: 400, // 카드 높이(240) + 카드 이름 + 카드번호 + 도트 + 여백을 고정
  },
  carouselContainer: { 
    flex: 0, 
    flexGrow: 0, 
    alignSelf: "stretch" 
  },
  dotsWrapper: { 
    marginBottom: 16 
  },

  // 혜택 안내 섹션 - 남은 공간을 모두 사용하고 스크롤 가능
  benefitsSection: {
    flex: 1, // 남은 공간을 모두 사용
    minHeight: 200, // 최소 높이 증가 (카드 섹션 높이 감소로 인해)
    paddingBottom: 16, // 하단 여백 추가
  },
  benefitsScrollView: {
    flex: 1,
    paddingBottom: 20, // 스크롤 시 하단 여백
  },

  // 로딩/에러 스타일
  benefitLoadingWrapper: { 
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16 
  },
  benefitLoadingText: { 
    color: colors.GRAY_NORMAL 
  },
  benefitErrorWrapper: { 
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16 
  },
  benefitErrorText: { 
    color: "tomato" 
  },
});
