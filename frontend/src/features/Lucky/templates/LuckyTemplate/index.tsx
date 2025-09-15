// src/features/Lucky/templates/LuckyTemplate/index.tsx
import React from "react";
import { Text, StyleSheet, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { LuckyTemplateProps } from "./types";
import { colors } from "@/shared/constants/colors";
import { CategoryChips } from "@/features/Lucky/ui/CategoryChips";
import { SaleCalendar } from "@/features/Lucky/ui/SaleCalendar";
import { SaleEventList } from "@/features/Lucky/ui/SaleEventList";
import { SeriesCards } from "@/features/Lucky/ui/SeriesCards";
import { font } from "@/shared/typography/font";

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

  /** 🔹 추가: 외부에서 주입받는 이미지 */
  nImageSource,
  molImageSource,
}: LuckyTemplateProps) {
  const safeEvents = Array.isArray(events) ? events : [];
  const safeMerchants = Array.isArray(merchants) ? merchants : [];
  const safeList = Array.isArray(eventsForDay) ? eventsForDay : [];

  return (
    <SafeAreaView
      style={s.container}
      edges={["top", "bottom", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.header}>세일</Text>

        <CategoryChips value={category} onChange={onChangeCategory} />

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
              /** 🔹 여기서 전달 */
              nImageSource={nImageSource}
              molImageSource={molImageSource}
            />
          </>
        )}

        <View style={s.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FBFF" },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  header: {
    fontSize: 20,
    color: colors.BLUE_DARKER,
    marginBottom: 8,
    ...font.bold,
  },
  spacerLarge: { height: 24 },
  bottomSpace: { height: 24 },
});
