// src/features/Lucky/screens/Lucky/index.tsx
import React, { useMemo, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import LuckyTemplate from "@/features/Lucky/templates/LuckyTemplate";
import { useSalesByMonth } from "@/features/Lucky/model/hooks";
import type { Category } from "@/features/Lucky/model/types";
import type { SaleEventListItem } from "@/features/Lucky/ui/SaleEventList/types";
import { router } from "expo-router"; // (이미 있으면 생략)

const now = new Date();

export default function LuckyScreen() {
  // ✅ month/year를 state로
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [category, setCategory] = useState<Category>("cafe");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // ✅ 훅에 state 사용
  const { data, isLoading } = useSalesByMonth(year, month, category);

  const eventsForDay: SaleEventListItem[] = useMemo(() => {
    if (!data || selectedDay == null) return [];
    return data.events
      .filter((e) => {
        const s = Number(e.startDate.slice(8, 10));
        const en = Number(e.endDate.slice(8, 10));
        return selectedDay >= s && selectedDay <= en;
      })
      .map((e) => {
        const s = new Date(e.startDate);
        const en = new Date(e.endDate);
        const merchant =
          data.merchants.find((m) => m.id === e.merchantId)?.name ?? "가맹점";
        const period =
          s.getDate() === en.getDate()
            ? `${s.getMonth() + 1}/${s.getDate()}`
            : `${s.getMonth() + 1}/${s.getDate()} ~ ${
                en.getMonth() + 1
              }/${en.getDate()}`;
        const color: "yellow" | "blue" =
          e.startDate === e.endDate ? "blue" : "yellow";
        return {
          id: e.id,
          merchant,
          title: e.title,
          period,
          note: e.note,
          color,
        };
      });
  }, [data, selectedDay]);

  if (isLoading || !data) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <LuckyTemplate
      year={year} // ✅ state 전달
      month={month} // ✅ state 전달
      category={category}
      selectedDay={selectedDay}
      onChangeCategory={(c) => {
        setCategory(c);
        setSelectedDay(null);
      }}
      onSelectDay={setSelectedDay}
      onChangeMonth={(y, m) => {
        setYear(y);
        setMonth(m);
        setSelectedDay(null);
      }}
      eventsForDay={eventsForDay}
      events={data.events}
      merchants={data.merchants}
      onPressNbbang={() => router.push("/(tabs)/lucky/nbbang")}
      onPressMolbbang={() => router.push("/(tabs)/lucky/molbbang")}
    />
  );
}
