import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { LuckyTemplateProps } from "./types";
import { colors } from "@/shared/constants/colors";
import { CategoryChips } from "@/features/Lucky/ui/CategoryChips";
import { SaleCalendar } from "@/features/Lucky/ui/SaleCalendar";
import { SaleEventList } from "@/features/Lucky/ui/SaleEventList";
import { SeriesCards } from "@/features/Lucky/ui/SeriesCards";

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
}: LuckyTemplateProps) {
  // ✅ 방어: 혹시 상위에서 실수로 undefined를 넘겨도 안전하게
  const safeEvents = Array.isArray(events) ? events : [];
  const safeMerchants = Array.isArray(merchants) ? merchants : [];
  const safeList = Array.isArray(eventsForDay) ? eventsForDay : [];

  return (
    <View style={s.container}>
      <Text style={s.header}>세일</Text>

      <CategoryChips value={category} onChange={onChangeCategory} />

      <View style={{ height: 8 }} />

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
          <View style={{ height: 16 }} />
          <SeriesCards
            onPressNbbang={onPressNbbang ?? (() => {})}
            onPressMolbbang={onPressMolbbang ?? (() => {})}
          />
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FBFF", padding: 16 },
  header: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.BLUE_DARKER,
    marginBottom: 8,
  },
});
