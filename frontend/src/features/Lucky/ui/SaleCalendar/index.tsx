import React, { memo, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  LayoutChangeEvent,
} from "react-native";
import type { SaleCalendarProps } from "./types";
import { colors } from "@/shared/constants/colors";
import { Feather } from "@expo/vector-icons";

const CELL_H = 64; // 날짜 셀 높이
const CELL_PAD_X = 6; // 셀 좌우 패딩(s.cell.padding과 일치)
const CELL_PAD_Y = 6; // 셀 상하 패딩
const BAR_INSET_X = 2; // 막대 좌우 추가 여백(미세 보정)
const BAR_HEIGHT = 14; // 막대 높이
const BAR_RADIUS = 7; // 막대 라운드
const DOW = ["일", "월", "화", "수", "목", "금", "토"] as const;

type BarColor = "yellow" | "blue";

// 숫자(일자) 텍스트 바로 아래 기준선 높이(폰트에 맞춰 조절)
const DAY_LINE_H = 18;
// 숫자와 막대 간 기본 간격
const BAR_BASE_GAP = 2;
// 색상별 위/아래 오프셋(+는 더 아래, -는 더 위)
const COLOR_TOP_OFFSET: Record<BarColor, number> = {
  yellow: 6, // 노란 막대: 숫자에서 더 내려 보이도록
  blue: -6, // 파란 막대: 숫자에 더 가깝게
};
// 같은 날 여러 개 겹칠 때 줄 간격
const LANE_GAP = 12;

type NormalizedEvent = {
  startDay: number;
  endDay: number;
  label: string;
  singleDay: boolean;
  color: BarColor;
};

function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate(); // m: 1-12
}
function firstDayIndex(y: number, m: number): number {
  return new Date(y, m - 1, 1).getDay(); // 0=일
}

/** 날짜 → (row, col) 좌표(0-based) */
function dayToCell(year: number, month: number, day: number) {
  const start = firstDayIndex(year, month);
  const idx = start + (day - 1);
  const row = Math.floor(idx / 7);
  const col = idx % 7;
  return { row, col };
}

/** 이벤트를 주(week) 단위로 잘라 세그먼트 목록 생성 */
function buildSegments(params: {
  year: number;
  month: number;
  events: NormalizedEvent[];
}) {
  const { year, month, events } = params;
  const segs: Array<{
    row: number;
    colStart: number;
    colSpan: number; // 1~7
    label: string;
    color: BarColor;
  }> = [];

  const startIdxBase = firstDayIndex(year, month);

  for (const e of events) {
    let s = e.startDay;
    const en = e.endDay;

    while (s <= en) {
      const { row, col } = dayToCell(year, month, s);
      const weekEndIdx = (row + 1) * 7 - 1; // 이 주의 마지막 셀 인덱스
      const startIdx = startIdxBase + (s - 1);
      const endIdxTarget = startIdxBase + (en - 1);
      const endIdxThisWeek = Math.min(weekEndIdx, endIdxTarget);
      const span = endIdxThisWeek - startIdx + 1;

      segs.push({
        row,
        colStart: col,
        colSpan: span,
        label: e.label,
        color: e.color,
      });

      // 다음 주로 넘어가기
      const nextStartIdx = endIdxThisWeek + 1;
      const nextDay = nextStartIdx - startIdxBase + 1;
      s = nextDay;
    }
  }
  return segs;
}

function SaleCalendarImpl({
  year,
  month,
  events,
  merchants,
  selectedDay,
  onSelectDay,
  onChangeMonth, // ✅ (새 prop) 월 전환 콜백
}: SaleCalendarProps) {
  const [gridW, setGridW] = useState<number>(0);
  const CELL_W = gridW > 0 ? gridW / 7 : 0;

  const dim = daysInMonth(year, month);
  const start = firstDayIndex(year, month);

  // 달력 그리드(빈칸 포함)
  const grid: Array<number | null> = useMemo(() => {
    const arr: Array<number | null> = Array(start).fill(null);
    for (let d = 1; d <= dim; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [dim, start]);

  // merchantId → 상호명
  const merchantNameMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const it of merchants) m.set(it.id, it.name);
    return m;
  }, [merchants]);

  // UI용 정규화
  const normalized: NormalizedEvent[] = useMemo(() => {
    return events.map((e) => ({
      startDay: Number(e.startDate.slice(8, 10)),
      endDay: Number(e.endDate.slice(8, 10)),
      label: merchantNameMap.get(e.merchantId) ?? "가맹점",
      singleDay: e.startDate === e.endDate,
      color: (e.startDate === e.endDate ? "blue" : "yellow") as BarColor,
    }));
  }, [events, merchantNameMap]);

  // 날짜에 이벤트 존재 여부(선택 하이라이트 도움)
  const dayHasEvent = useMemo(() => {
    const set = new Set<number>();
    for (const e of normalized) {
      for (let d = e.startDay; d <= e.endDay; d++) set.add(d);
    }
    return set;
  }, [normalized]);

  // 주 단위 세그먼트
  const segments = useMemo(
    () => buildSegments({ year, month, events: normalized }),
    [year, month, normalized]
  );

  const onGridLayout = useCallback((e: LayoutChangeEvent) => {
    setGridW(e.nativeEvent.layout.width);
  }, []);

  // ✅ 월 전환 핸들러 (이전/다음)
  const changeMonth = useCallback(
    (delta: number) => {
      const d = new Date(year, month - 1 + delta, 1);
      const ny = d.getFullYear();
      const nm = d.getMonth() + 1;
      onChangeMonth?.(ny, nm);
      onSelectDay?.(null); // 월 변경 시 선택 해제
    },
    [year, month, onChangeMonth, onSelectDay]
  );

  // ✅ 날짜 탭 → 토글(같은 날 한 번 더 누르면 해제)
  const onPressDay = useCallback(
    (day: number) => {
      const next = selectedDay === day ? null : day;
      onSelectDay?.(next);
    },
    [selectedDay, onSelectDay]
  );

  return (
    <View style={s.wrap}>
      {/* ▼ 월 전환 네비게이션 */}
      <View style={s.navRow}>
        <Pressable
          style={({ pressed }) => [s.navBtn, pressed && s.navBtnPressed]}
          onPress={() => changeMonth(-1)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="이전 달"
        >
          <Feather
            name="chevron-left"
            size={20}
            color={colors.BLUE_DARK_ACTIVE}
          />
        </Pressable>

        <Text style={s.monthTitle}>
          {year}년 {month}월
        </Text>

        <Pressable
          style={({ pressed }) => [s.navBtn, pressed && s.navBtnPressed]}
          onPress={() => changeMonth(1)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="다음 달"
        >
          <Feather
            name="chevron-right"
            size={20}
            color={colors.BLUE_DARK_ACTIVE}
          />
        </Pressable>
      </View>

      {/* 요일 헤더 */}
      <View style={s.row}>
        {DOW.map((d) => (
          <Text key={d} style={s.dow}>
            {d}
          </Text>
        ))}
      </View>

      {/* 날짜 그리드 */}
      <View style={s.grid} onLayout={onGridLayout}>
        {grid.map((day, i) => {
          const isSelected = day != null && day === selectedDay;
          const hasEvent = day != null && dayHasEvent.has(day);
          return (
            <Pressable
              key={i}
              style={s.cell}
              disabled={day == null}
              onPress={() => day != null && onPressDay(day)}
              android_ripple={{ borderless: true }}
              accessibilityRole="button"
              accessibilityState={{ selected: !!isSelected }}
              accessibilityLabel={day ? `${month}월 ${day}일` : undefined}
            >
              {day ? (
                <View
                  style={[
                    s.dayWrap,
                    isSelected && s.dayWrapSel,
                    hasEvent && s.dayWrapEvent,
                  ]}
                >
                  <Text style={s.day}>{day}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}

        {/* 형광펜 막대 오버레이 */}
        {CELL_W > 0 &&
          segments.map((seg, idx) => {
            // 좌우 정렬: 셀 padding + 미세보정
            const left = Math.round(
              seg.colStart * CELL_W + CELL_PAD_X + BAR_INSET_X
            );
            const width = Math.round(
              seg.colSpan * CELL_W - (CELL_PAD_X + BAR_INSET_X) * 2
            );

            // 세로 정렬: 숫자 라인 기준 + 색상별 오프셋 + 레인 간격
            const lane = idx % 2; // 간단히 2줄까지
            const baseTop =
              seg.row * CELL_H + CELL_PAD_Y + DAY_LINE_H + BAR_BASE_GAP;
            const top = Math.round(
              baseTop + COLOR_TOP_OFFSET[seg.color] + lane * LANE_GAP
            );

            const bg =
              seg.color === "yellow"
                ? colors.YELLOW_LIGHT_ACTIVE
                : colors.BLUE_NORMAL;
            const labelColor =
              seg.color === "yellow" ? colors.BLUE_DARKER : "#fff";

            return (
              <View
                key={`${seg.row}-${seg.colStart}-${idx}`}
                style={[
                  s.bar,
                  {
                    left,
                    top,
                    width: Math.max(width, 24),
                    backgroundColor: bg,
                  },
                ]}
                pointerEvents="none"
              >
                <Text
                  style={[s.barLabel, { color: labelColor }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  allowFontScaling={false}
                >
                  {seg.label}
                </Text>
              </View>
            );
          })}
      </View>
    </View>
  );
}

export const SaleCalendar = memo(SaleCalendarImpl);

const s = StyleSheet.create({
  wrap: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  // ▼ 월 전환
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // ✅ 가운데 묶기
    marginBottom: 6,
  },
  navBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "transparent",
    marginHorizontal: 6, // ✅ 월 텍스트와 간격
  },
  navBtnPressed: {
    opacity: 0.5, // 탭 시 피드백
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.BLUE_DARK_ACTIVE,
  },

  // ▼ 요일 헤더
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  dow: {
    width: `${100 / 7}%`,
    textAlign: "center",
    fontWeight: "700",
    color: colors.BLUE_DARKER,
  },

  // ▼ 날짜 그리드/셀
  grid: {
    position: "relative",
    flexDirection: "row",
    flexWrap: "wrap",
    overflow: "visible",
  },
  cell: {
    width: `${100 / 7}%`,
    height: CELL_H,
    paddingHorizontal: CELL_PAD_X,
    paddingVertical: CELL_PAD_Y,
  },
  dayWrap: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  dayWrapSel: {
    backgroundColor: "#eef6ff",
  },
  dayWrapEvent: {},
  day: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: colors.BLUE_DARK_ACTIVE,
    textAlign: "center",
  },

  // ▼ 형광펜 막대
  bar: {
    position: "absolute",
    height: BAR_HEIGHT,
    borderRadius: BAR_RADIUS,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  barLabel: {
    width: "100%",
    textAlign: "center",
    fontSize: 10,
    fontWeight: "800",
    includeFontPadding: false,
  },
});
