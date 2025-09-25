// src/features/Lucky/screens/Lucky/index.tsx
import { useSalesByMonth } from "@/features/Lucky/model/hooks";
import type { Category } from "@/features/Lucky/model/types";
import LuckyTemplate from "@/features/Lucky/templates/LuckyTemplate";
import type { SaleEventListItem } from "@/features/Lucky/ui/SaleEventList/types";
import { useAuthGuard } from "@/shared/hooks/useAuthGuard";
import { useRouter } from "expo-router"; // ✅ 변경: 훅 사용
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";

const now = new Date();

export default function LuckyScreen() {
  const router = useRouter(); // ✅ 훅으로 라우터 가져오기

  // 인증 가드
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard();

  // month/year를 state로
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [category, setCategory] = useState<Category>("cafe_snack");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // 훅에 state 사용
  const { data, isLoading, error } = useSalesByMonth(year, month, category);

  // 디버깅용 로그
  // console.log('LuckyScreen - API 상태:', { isLoading, error, data: data ? '데이터 있음' : '데이터 없음' });

  const eventsForDay = useMemo((): SaleEventListItem[] => {
    if (!data || selectedDay == null) return [];

    // 달력과 동일한 색상 할당 로직 - 전체 이벤트 기준으로 색상 할당
    const availableColors: (
      | "yellow"
      | "blue"
      | "green"
      | "purple"
      | "orange"
      | "pink"
    )[] = ["yellow", "blue", "green", "purple", "orange", "pink"];
    const usedColors = new Set<string>();

    // 전체 이벤트에 대해 달력과 동일한 순서로 색상 할당
    const colorMap = new Map<
      string,
      "yellow" | "blue" | "green" | "purple" | "orange" | "pink"
    >();
    data.events.forEach((e, index) => {
      let colorIndex = index;
      while (
        usedColors.has(availableColors[colorIndex % availableColors.length])
      ) {
        colorIndex++;
      }
      const selectedColor =
        availableColors[colorIndex % availableColors.length];
      usedColors.add(selectedColor);
      colorMap.set(e.id, selectedColor);
    });

    const filteredEvents = data.events.filter((e) => {
      const s = Number(e.startDate.slice(8, 10));
      const en = Number(e.endDate.slice(8, 10));
      return selectedDay >= s && selectedDay <= en;
    });

    return filteredEvents.map((e) => {
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

      return {
        id: e.id,
        merchant,
        title: e.title,
        period,
        note: e.note,
        color: colorMap.get(e.id) || "blue", // 달력에서 할당된 색상 사용
      };
    });
  }, [data, selectedDay]);

  // ✅ 이동 핸들러 (useCallback으로 메모이즈)
  const handlePressNbbang = useCallback(() => {
    router.push("/nbbang");
  }, [router]);

  const handlePressMolbbang = useCallback(() => {
    router.push("/molbbang");
  }, [router]);

  // 인증 로딩 중이거나 인증되지 않은 경우
  if (authLoading || !isAuthenticated) {
    return null; // useAuthGuard에서 자동으로 리다이렉트됨
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10 }}>로딩 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "red" }}>에러 발생: {error.message}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>데이터가 없습니다.</Text>
      </View>
    );
  }

  return (
    <LuckyTemplate
      year={year}
      month={month}
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
      nImageSource={require("@/assets/images/illustration/n_bbang.png")}
      molImageSource={require("@/assets/images/illustration/mol_bbang.png")}
      onPressNbbang={handlePressNbbang}
      onPressMolbbang={handlePressMolbbang}
    />
  );
}
