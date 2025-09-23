// src/features/Lucky/templates/LuckyTemplate/index.tsx
import { SaleCalendar } from "@/features/Lucky/ui/SaleCalendar";
import { SaleEventList } from "@/features/Lucky/ui/SaleEventList";
import { SeriesCards } from "@/features/Lucky/ui/SeriesCards";
import NotificationIcon from "@/shared/components/NotificationIcon";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import type { LuckyTemplateProps } from "./types";

export default function LuckyTemplate({
  year,
  month,
  category,
  selectedDay,
  onChangeCategory,
  onSelectDay,
  onChangeMonth,
  events,
  merchants,
  eventsForDay,
  onPressNbbang,
  onPressMolbbang,
  nImageSource,
  molImageSource,
  onNotificationPress,
}: LuckyTemplateProps) {
  const safeEvents = Array.isArray(events) ? events : [];
  const safeMerchants = Array.isArray(merchants) ? merchants : [];
  const safeList = Array.isArray(eventsForDay) ? eventsForDay : [];

  // 👇 HomeTemplate처럼: 탭바 + 안전영역 고려
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight(); // 커스텀 탭바여도 react-navigation 탭이면 OK

  return (
    <SafeAreaView style={s.safeArea} edges={["top", "bottom"]}>
      {/* 알림 아이콘 */}
      <NotificationIcon onPress={onNotificationPress} />

      {/* HomeTemplate의 overlayContainer 패턴 */}
      <View style={s.overlayContainer}>
        <ScrollView
          style={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            s.content,
            {
              // 👇 탭바 뒤로 안 들어가게 여유를 넉넉히
              paddingBottom: tabBarHeight + insets.bottom + 24,
            },
          ]}
        >
          <Text style={s.header}>세일</Text>


          <SaleCalendar
            year={year}
            month={month}
            events={safeEvents}
            merchants={safeMerchants}
            selectedDay={selectedDay ?? null}
            onSelectDay={onSelectDay}
            onChangeMonth={onChangeMonth}
          />

          <SaleEventList items={safeList} />

          {(onPressNbbang || onPressMolbbang) && (
            <>
              <View style={s.spacerLarge} />
              <SeriesCards
                onPressNbbang={onPressNbbang ?? (() => {})}
                onPressMolbbang={onPressMolbbang ?? (() => {})}
                nImageSource={nImageSource}
                molImageSource={molImageSource}
              />
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FBFF",
  },
  // HomeTemplate처럼 오버레이로 전체 감싸기
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 50,
    // paddingBottom은 runtime에서 추가됨
  },
  header: {
    fontSize: 20,
    color: colors.BLUE_DARKER,
    marginBottom: 8,
    ...font.bold,
  },
  spacerLarge: { height: 24 },
});
