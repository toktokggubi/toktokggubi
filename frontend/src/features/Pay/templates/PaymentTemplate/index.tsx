import type { UserCardVM } from "@/features/User/model/card/types";
import PagerDots from "@/features/User/ui/PagerDots";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import CardSlide from "@/shared/ui/CardSlide";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import SegmentedTabs from "~features/Pay/ui/SegmentedTabs";
import type { PaymentTemplateProps } from "./types";

import type { Gifticon } from "@/shared/types/gifticon";
import GifticonSlide from "@/shared/ui/GifticonSlide";

const { width: SCREEN_W } = Dimensions.get("window");
const ITEM_W = Math.round(SCREEN_W * 0.8);
const ITEM_W_LARGE = Math.round(SCREEN_W * 0.8); // 가맹점이 없을 때 더 큰 카드
const GIFTICON_ITEM_W = 296; // 기프티콘 카드 너비 (280 + 16 margin)

function PaymentTemplate({
  selectedTab,
  onChangeTab,
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
  refreshControl,
}: PaymentTemplateProps) {
  const router = useRouter();
  const carouselRef = useRef<ICarouselInstance | null>(null);
  const isInitialized = useRef(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const progress = useSharedValue<number>(0);
  const gifticonProgress = useSharedValue<number>(0);

  const handleBack = () => {
    router.back();
  };

  // 스와이프 제스처 처리
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => {
      return !isTransitioning;
    },
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // 수평 스와이프만 감지 (세로 스와이프는 무시)
      return (
        !isTransitioning &&
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
        Math.abs(gestureState.dx) > 10
      );
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

    // 캐러셀이 준비될 때까지 약간의 지연
    setTimeout(() => {
      if (carouselRef.current) {
        carouselRef.current.scrollTo({ index: clamped, animated: true });
      }
    }, 100);
  }, [activeCardIndex]);

  // 카드 탭으로 돌아올 때 activeCardIndex로 스냅
  useEffect(() => {
    if (selectedTab === 0 && carouselRef.current && cards.length > 0) {
      const clamped = Math.max(0, Math.min(activeCardIndex, cards.length - 1));

      // 약간의 지연 후 스냅
      setTimeout(() => {
        if (carouselRef.current) {
          carouselRef.current.scrollTo({ index: clamped, animated: true });
        }
      }, 200); // 200ms 지연
    }
  }, [selectedTab, activeCardIndex, cards.length]);

  // 카드 인덱스 변경 처리
  const handleCardChange = (index: number) => {
    const id = cards[index]?.userCardId;
    if (id != null) onActiveCardChange?.(index, id);
  };

  // 카드 터치 핸들러 - QR 스캐너로 이동
  const handleCardPress = () => {
    if (cards.length === 0 || !cards[activeCardIndex]) {
      Alert.alert("오류", "카드 정보를 불러올 수 없습니다.");
      return;
    }

    const selectedCard = cards[activeCardIndex];
    router.push({
      pathname: "/pay/qr-scanner",
      params: {
        cardId: selectedCard.userCardId.toString(),
        cardName: selectedCard.cardName || "카드명 없음",
        last4: selectedCard.last4 || "0000",
        source: "payment"
      }
    });
  };

  const renderCard = useCallback(({ item }: { item: UserCardVM }) => {
    return <CardSlide card={item} />;
  }, []); // selectedTab 의존성 제거로 불필요한 리렌더링 방지

  // 카드 기프티콘
  const giftCarouselRef = useRef<ICarouselInstance | null>(null);
  const [currentGiftIndex, setCurrentGiftIndex] = useState(0);

  const handleGiftChange = (index: number) => {
    setCurrentGiftIndex(index);
  };

  const renderGifticon = ({ item }: { item: Gifticon }) => {
    // imageUrl을 imageSource로 변환
    const gifticonCard = {
      ...item,
      imageSource: item.imageUrl ? { uri: item.imageUrl } : undefined,
    };
    return <GifticonSlide gifticon={gifticonCard} />;
  };

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

      {/* ScrollView로 감싸서 Pull-to-Refresh 지원 */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
      >
        {/* 카드 탭일 때 카드 캐러셀 표시 */}
        {selectedTab === 0 ? (
          <View style={styles.cardContainer}>
            {cardTopSection ? (
              <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
                {cardTopSection}
              </View>
            ) : null}
            {cards.length === 0 ? (
              <View style={styles.empty}>
                {/* cardTopSection에서 전달된 UI가 표시됨 */}
              </View>
            ) : (
              <>
              {selectedTab === 0 && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleCardPress}
                  style={styles.carouselTouchArea}
                >
                  <Carousel
                    ref={carouselRef}
                    data={cards}
                    renderItem={renderCard}
                    width={ITEM_W}
                    height={250}
                    loop={false}
                    autoPlay={false}
                    pagingEnabled={true}
                    scrollAnimationDuration={300}
                    onSnapToItem={handleCardChange}
                    onProgressChange={progress}
                    mode="parallax"
                    modeConfig={{
                      parallaxScrollingScale: 0.92,
                      parallaxScrollingOffset: 80,
                    }}
                    style={styles.carouselContainer}
                  />
                </TouchableOpacity>
              )}
              {selectedTab === 0 && cards.length > 0 && (
                <>
                  {/* 카드 정보 영역 - 고정 위치 */}
                  {cards[activeCardIndex] && (
                    <View style={styles.cardInfoSection}>
                      <Text style={styles.cardName}>{cards[activeCardIndex].cardName || "카드명 없음"}</Text>
                      <Text style={styles.cardNumber}>**** **** **** {cards[activeCardIndex].last4 || "0000"}</Text>
                    </View>
                  )}
                  
                  <PagerDots
                    length={cards.length}
                    activeIndex={activeCardIndex}
                  />
                </>
              )}
              {benefitsSection ? (
                <View
                  style={{ marginTop: 8, marginBottom:12 }}
                  {...panResponder.panHandlers}
                >
                  {benefitsSection}
                </View>
              ) : null}
              {cardBottomSection ? (
                <View
                  style={{ marginTop: 0, marginBottom: 12 }}
                  {...panResponder.panHandlers}
                >
                  {cardBottomSection}
                </View>
              ) : null}
              </>
            )}
          </View>
        ) : (
          // 기프티콘 탭일 때 children 표시
          <View style={styles.cardContainer}>
            {gifticonTopSection ? (
              <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
                {gifticonTopSection}
              </View>
            ) : null}

            {(() => {
              // 만료되지 않은 기프티콘만 필터링
              const activeGifticons = gifticons.filter(gifticon => gifticon.status === "ACTIVE");
              
              if (activeGifticons.length === 0 || gifticonBottomSection) {
                // 기프티콘이 없거나 gifticonBottomSection이 있을 때는 여기서 직접 표시
                return (
                  <View style={{ flex: 1 }}>
                    {gifticonBottomSection}
                  </View>
                );
              }
              
              return (
                <>
                  <Carousel
                    ref={giftCarouselRef}
                    data={activeGifticons}
                    renderItem={renderGifticon}
                    width={ITEM_W}
                    height={220}
                    loop={false}
                    autoPlay={false}
                    pagingEnabled={true}
                    scrollAnimationDuration={300}
                    onSnapToItem={handleGiftChange}
                    onProgressChange={gifticonProgress}
                    mode="parallax"
                    modeConfig={{
                      parallaxScrollingScale: 0.92,
                      parallaxScrollingOffset: 80,
                    }}
                    style={styles.carouselContainer}
                  />
                </>
              );
            })()}

            {(() => {
              const activeGifticons = gifticons.filter(gifticon => gifticon.status === "ACTIVE");
              return activeGifticons.length > 0 && gifticonBottomSection ? (
                <View
                  style={styles.gifticonBottomContainer}
                  {...panResponder.panHandlers}
                >
                  {gifticonBottomSection}
                </View>
              ) : null;
            })()}
            
            {/* 기프티콘 탭에서만 정보와 PagerDots 표시 */}
            {selectedTab === 1 && (() => {
              const activeGifticons = gifticons.filter(gifticon => gifticon.status === "ACTIVE");
              return activeGifticons.length > 0 ? (
                <>
                  {/* 기프티콘 정보 영역 - 하단 위치 */}
                  {activeGifticons[currentGiftIndex] && (
                    <View style={styles.gifticonInfoSection}>
                      <Text style={styles.gifticonName}>{activeGifticons[currentGiftIndex].label || "기프티콘명 없음"}</Text>
                      <Text style={styles.gifticonBrand}>{activeGifticons[currentGiftIndex].merchantName || "브랜드 정보 없음"}</Text>
                    </View>
                  )}
                  
                  <PagerDots
                    length={activeGifticons.length}
                    activeIndex={currentGiftIndex}
                  />
                </>
              ) : null;
            })()}
            
          </View>
        )}
      </ScrollView>
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    ...font.medium,
  },
  carouselContainer: { 
    flex: 0, 
    flexGrow: 0, 
    alignSelf: "center",
    alignItems: "center",
    overflow: "visible",
  },
  carouselTouchArea: {
    flex: 0,
    alignSelf: "center",
  },
  cardInfoSection: {
    alignItems: "center",
    marginTop: -2,
    marginBottom: -4,
    paddingHorizontal: 16,
  },
  cardName: {
    fontSize: 18,
    ...font.bold,
    color: colors.GRAY_DARKER,
    textAlign: "center",
    marginBottom: -10,
  },
  cardNumber: {
    fontSize: 14,
    color: colors.GRAY_NORMAL,
    textAlign: "center",
  },
  gifticonInfoSection: {
    alignItems: "center",
    marginTop: 160,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  gifticonName: {
    fontSize: 18,
    ...font.bold,
    color: colors.GRAY_DARKER,
    textAlign: "center",
    marginBottom: 4,
  },
  gifticonBrand: {
    fontSize: 14,
    color: colors.GRAY_NORMAL,
    textAlign: "center",
  },
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
    ...font.medium,
    textAlign: "center",
  },
});
