import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Carousel from "react-native-snap-carousel";
import SegmentedTabs from "~features/Pay/ui/SegmentedTabs";
import CardSlide from "@/shared/ui/CardSlide";
import PagerDots from "@/features/User/ui/PagerDots";
import type { PaymentTemplateProps } from "./types";
import type { UserCard } from "@/features/User/screens/MyPageScreen/types";
import { colors } from "@/shared/constants/colors";

const { width: SCREEN_W } = Dimensions.get("window");
const ITEM_W = Math.round(SCREEN_W * 0.68);

function PaymentTemplate({
  selectedTab,
  onChangeTab,
  children,
  cards = [],
  activeCardIndex = 0,
  onActiveCardChange,
}: PaymentTemplateProps) {
  const carouselRef = useRef<Carousel<UserCard> | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(activeCardIndex);

  // 부모가 activeCardIndex를 바꾸면 해당 위치로 스냅
  useEffect(() => {
    if (!carouselRef.current) return;
    if (cards.length === 0) return;
    const clamped = Math.max(0, Math.min(activeCardIndex, cards.length - 1));
    carouselRef.current.snapToItem(clamped, false);
    setCurrentCardIndex(clamped);
  }, [activeCardIndex, cards.length]);

  // 카드 인덱스 변경 처리
  const handleCardChange = (index: number) => {
    setCurrentCardIndex(index);
    onActiveCardChange?.(index);
  };

  const renderCard = ({ item }: { item: UserCard; index: number }) => {
    return <CardSlide card={item} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 탭 */}
      <View style={styles.tap}>
        <SegmentedTabs
          options={["카드", "기프티콘"]}
          value={selectedTab}
          onChange={onChangeTab}
          height={40}
        />
      </View>

      {/* 카드 탭일 때 카드 캐러셀 표시 */}
      {selectedTab === 0 ? (
        cards.length === 0 ? (
          <View style={[styles.cardContainer, styles.empty]}>
            <Text style={styles.emptyText}>등록된 카드가 없어요</Text>
          </View>
        ) : (
          <View style={styles.cardContainer}>
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
              onSnapToItem={handleCardChange}
              keyExtractor={(item, index) =>
                String(item.userCardId) ?? String(index)
              }
            />
            <PagerDots length={cards.length} activeIndex={currentCardIndex} />
          </View>
        )
      ) : (
        // 기프티콘 탭일 때 children 표시
        <View style={styles.content}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export default PaymentTemplate;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_PRIMARY,
    paddingTop: 50,
  },
  tap: {
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: "#F8FBFF",
    paddingTop: 20,
    paddingHorizontal: 0,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "600",
  },
});
