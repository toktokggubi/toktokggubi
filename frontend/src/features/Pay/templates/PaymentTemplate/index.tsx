import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  PanResponder,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Carousel from "react-native-snap-carousel";
import SegmentedTabs from "~features/Pay/ui/SegmentedTabs";
import CardSlide from "@/shared/ui/CardSlide";
import PagerDots from "@/features/User/ui/PagerDots";
import type { PaymentTemplateProps } from "./types";
import type { UserCard } from "@/features/User/screens/MyPageScreen/types"; // TODO: 맞춰서 수정
import { colors } from "@/shared/constants/colors";

import GifticonSlide from "@/shared/ui/GifticonSlide";
import type { Gifticon } from "@/shared/types/gifticon";

const { width: SCREEN_W } = Dimensions.get("window");
const ITEM_W = Math.round(SCREEN_W * 0.68);
const ITEM_W_LARGE = Math.round(SCREEN_W * 0.68); // 가맹점이 없을 때 더 큰 카드
const GIFTICON_ITEM_W = 296; // 기프티콘 카드 너비 (280 + 16 margin)

function PaymentTemplate({
  selectedTab,
  onChangeTab,
  children,
  cards = [],
  activeCardIndex = 0,
  onActiveCardChange,
  benefitsSection,
  cardTopSection,
  cardBottomSection,
  gifticons = [] as Gifticon[],
  activeGifticonIndex = 0,
  onActiveGifticonChange,
  gifticonTopSection,
  gifticonBottomSection,
}: PaymentTemplateProps) {
  const router = useRouter();
  const carouselRef = useRef<Carousel<UserCard> | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(activeCardIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleBack = () => {
    router.back();
  };

  // 스와이프 제스처 처리
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !isTransitioning,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // 수평 스와이프만 감지 (세로 스와이프는 무시)
      return !isTransitioning && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
    },
    onPanResponderGrant: () => {
      // 제스처 시작 시 즉시 반응
    },
    onPanResponderMove: (evt, gestureState) => {
      if (isTransitioning) return;
      
      // 실시간으로 스와이프 감지하여 더 빠른 반응
      const { dx } = gestureState;
      
      // 오른쪽으로 스와이프 (카드 → 기프티콘)
      if (dx > 30 && selectedTab === 0) {
        setIsTransitioning(true);
        onChangeTab(1);
        setTimeout(() => setIsTransitioning(false), 300);
      }
      // 왼쪽으로 스와이프 (기프티콘 → 카드)
      else if (dx < -30 && selectedTab === 1) {
        setIsTransitioning(true);
        onChangeTab(0);
        setTimeout(() => setIsTransitioning(false), 300);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (isTransitioning) return;
      
      const { dx, vx } = gestureState;
      
      // 속도와 거리를 모두 고려하여 더 정확한 판단
      const isFastSwipe = Math.abs(vx) > 0.5;
      
      // 오른쪽으로 스와이프 (카드 → 기프티콘)
      if ((dx > 20 || (isFastSwipe && dx > 10)) && selectedTab === 0) {
        setIsTransitioning(true);
        onChangeTab(1);
        setTimeout(() => setIsTransitioning(false), 300);
      }
      // 왼쪽으로 스와이프 (기프티콘 → 카드)
      else if ((dx < -20 || (isFastSwipe && dx < -10)) && selectedTab === 1) {
        setIsTransitioning(true);
        onChangeTab(0);
        setTimeout(() => setIsTransitioning(false), 300);
      }
    },
  });

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
    const id = cards[index]?.userCardId;
    if (id != null) onActiveCardChange?.(index, id);
  };

  const renderCard = ({ item }: { item: UserCard; index: number }) => {
    return <CardSlide card={item} />;
  };

  // 카드 기프티콘
  const giftCarouselRef = useRef<Carousel<Gifticon> | null>(null);
  const [currentGiftIndex, setCurrentGiftIndex] = useState(0);

  const handleGiftChange = (index: number) => {
    setCurrentGiftIndex(index);
  };

  const renderGifticon = ({ item }: { item: Gifticon; index: number }) => (
    <GifticonSlide gifticon={item} />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 X 버튼 */}
      <View style={styles.topHeader} {...panResponder.panHandlers}>
        <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
          <Ionicons name="close" size={24} color={colors.GRAY_DARK} />
        </TouchableOpacity>
      </View>

      {/* 상단 탭 */}
      <View style={styles.tap} {...panResponder.panHandlers}>
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
            {cardTopSection ? (
              <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
                {cardTopSection}
              </View>
            ) : null}
            <Carousel<UserCard>
              ref={carouselRef}
              data={cards}
              renderItem={renderCard}
              sliderWidth={SCREEN_W}
              itemWidth={benefitsSection ? ITEM_W : ITEM_W_LARGE}
              inactiveSlideScale={0.92}
              inactiveSlideOpacity={1}
              activeSlideAlignment="center"
              vertical={false}
              onSnapToItem={handleCardChange}
              keyExtractor={(item, index) =>
                item?.userCardId != null
                  ? String(item.userCardId)
                  : String(index)
              }
              containerCustomStyle={styles.carouselContainer}
            />
            <PagerDots length={cards.length} activeIndex={currentCardIndex} />
            {benefitsSection ? (
              <View style={{ marginTop: 8, marginBottom: 12 }} {...panResponder.panHandlers}>
                {benefitsSection}
              </View>
            ) : null}
            {cardBottomSection ? (
              <View style={{ marginTop: 8, marginBottom: 12 }} {...panResponder.panHandlers}>
                {cardBottomSection}
              </View>
            ) : null}
          </View>
        )
      ) : (
        // 기프티콘 탭일 때 children 표시
        <View style={styles.cardContainer}>
          {gifticonTopSection ? (
            <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
              {gifticonTopSection}
            </View>
          ) : null}

          {gifticons.length === 0 ? (
            <View style={[styles.cardContainer, styles.empty]}>
              <Text style={styles.emptyText}>보유한 기프티콘이 없어요</Text>
            </View>
          ) : (
            <>
              <Carousel<Gifticon>
                ref={giftCarouselRef}
                data={gifticons}
                renderItem={({ item }) => <GifticonSlide gifticon={item} />}
                sliderWidth={SCREEN_W}
                itemWidth={GIFTICON_ITEM_W}
                inactiveSlideScale={0.92}
                inactiveSlideOpacity={1}
                activeSlideAlignment="center"
                vertical={false}
                onSnapToItem={handleGiftChange}
                // 타입 에러 나면 keyExtractor는 지워도 OK
                keyExtractor={(item, idx) =>
                  item?.gifticonId != null
                    ? String(item.gifticonId)
                    : String(idx)
                }
                containerCustomStyle={styles.carouselContainer}
              />
              <PagerDots
                length={gifticons.length}
                activeIndex={currentGiftIndex}
              />
            </>
          )}

          {gifticonBottomSection ? (
            <View style={styles.gifticonBottomContainer} {...panResponder.panHandlers}>
              {gifticonBottomSection}
            </View>
          ) : null}
          <View style={styles.instructionContainer} {...panResponder.panHandlers}>
            <Text style={styles.instructionText}>바코드를 찍어주세요</Text>
          </View>
        </View>
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
  topHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  tap: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.GRAY_LIGHT,
    justifyContent: "center",
    alignItems: "center",
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
  carouselContainer: { flex: 0, flexGrow: 0, alignSelf: "stretch" },
  gifticonBottomContainer: {
    marginTop: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  instructionContainer: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 20,
  },
  instructionText: {
    color: colors.GRAY_NORMAL,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
