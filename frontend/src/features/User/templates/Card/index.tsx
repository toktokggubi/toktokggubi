// C:\Users\SSAFY\Desktop\kwonjaeun\project2\S13P21B207\frontend\src\features\User\templates\Card\index.tsx
import React, { useState, useRef } from "react";
import { View, Dimensions } from "react-native";
import Carousel from "react-native-snap-carousel";
import type { CardCarouselTemplateProps, UserCard } from "./types";
import CardSlide from "@/features/User/ui/CardSlide";
import PagerDots from "@/features/User/ui/PagerDots";

const { width: SCREEN_W } = Dimensions.get("window");
const ITEM_W = Math.round(SCREEN_W * 0.74);

export default function CardCarouselTemplate({
  cards,
}: CardCarouselTemplateProps) {
  const [active, setActive] = useState(0);
  const carouselRef = useRef<Carousel<UserCard> | null>(null);

  // 라이브러리 시그니처에 딱 맞춤
  const renderCard = ({ item }: { item: UserCard; index: number }) => {
    return <CardSlide card={item} />;
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FBFF", paddingTop: 20 }}>
      <Carousel<UserCard>
        ref={carouselRef}
        data={cards}
        renderItem={renderCard}
        sliderWidth={SCREEN_W}
        itemWidth={ITEM_W}
        inactiveSlideScale={0.92}
        inactiveSlideOpacity={1}
        contentContainerCustomStyle={{
          // 양옆 카드 살짝 보이게 패딩 보정
          paddingHorizontal: (SCREEN_W - ITEM_W) / 2,
        }}
        vertical={false}
        onSnapToItem={setActive}
      />
      <PagerDots length={cards.length} activeIndex={active} />
    </View>
  );
}
