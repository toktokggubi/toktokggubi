import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import { Feather } from "@expo/vector-icons";
import React, { memo, useCallback, useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { SaleCalendarProps } from "./types";

const CELL_H = 64; // 날짜 셀 높이
const CELL_PAD_X = 6; // 셀 좌우 패딩(s.cell.padding과 일치)
const CELL_PAD_Y = 6; // 셀 상하 패딩
const BAR_INSET_X = 0; // 막대 좌우 추가 여백(미세 보정)
const BAR_HEIGHT = 14; // 막대 높이

const DOW = ["일", "월", "화", "수", "목", "금", "토"] as const;

type BarColor = "yellow" | "blue" | "green" | "purple" | "orange" | "pink";

// 숫자(일자) 텍스트 바로 아래 기준선 높이(폰트에 맞춰 조절)
const DAY_LINE_H = 18;
// 숫자와 막대 간 기본 간격
const BAR_BASE_GAP = 2;
// 색상별 위/아래 오프셋(+는 더 아래, -는 더 위)
const COLOR_TOP_OFFSET: Record<BarColor, number> = {
  yellow: 6, // 노란 막대: 숫자에서 더 내려 보이도록
  blue: -6, // 파란 막대: 숫자에 더 가깝게
  green: 0, // 초록 막대: 중간
  purple: -3, // 보라 막대: 조금 위
  orange: 3, // 주황 막대: 조금 아래
  pink: -9, // 분홍 막대: 가장 위
};
// 같은 날 여러 개 겹칠 때 줄 간격 (여백 완전 제거)
const LANE_GAP = 0; // 여백 없이 바로 붙이기

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
  originalEvents: any[]; // 원본 이벤트 배열
}) {
  const { year, month, events, originalEvents } = params;
  const segs: Array<{
    row: number;
    colStart: number;
    colSpan: number; // 1~7
    label: string;
    color: BarColor;
    lane: number; // 세로 레인 번호 (0, 1, 2, ...)
    originalIndex: number; // 원래 이벤트 배열에서의 인덱스
  }> = [];

  const startIdxBase = firstDayIndex(year, month);

  for (let eventIndex = 0; eventIndex < events.length; eventIndex++) {
    const e = events[eventIndex];
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
        lane: 0, // 기본값, 나중에 계산됨
        originalIndex: eventIndex, // 원래 이벤트 배열에서의 인덱스
      });

      // 다음 주로 넘어가기
      const nextStartIdx = endIdxThisWeek + 1;
      const nextDay = nextStartIdx - startIdxBase + 1;
      s = nextDay;
    }
  }

  // 전역 레인 할당 - 시작일이 빠른 이벤트가 항상 위쪽 레인에 (여백 없이)
  const eventLanes = new Map<number, number>(); // originalIndex -> lane
  
  // 1. 모든 이벤트를 시작일 기준으로 정렬 (시작일이 빠를수록 앞에)
  const sortedEvents = originalEvents
    .map((event, index) => ({
      originalIndex: index,
      startDay: Number(event.startDate.slice(8, 10)),
      event
    }))
    .sort((a, b) => a.startDay - b.startDay);
  
  // 2. 각 이벤트에 순차적으로 레인 할당
  // 시작일이 빠른 이벤트가 레인 0(가장 위), 다음이 레인 1, ...
  sortedEvents.forEach((item, index) => {
    eventLanes.set(item.originalIndex, index);
  });
  
  // 3. 모든 세그먼트에 레인 할당
  for (const seg of segs) {
    seg.lane = eventLanes.get(seg.originalIndex) || 0;
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

  // UI용 정규화 - 색상 중복 방지
  const normalized: NormalizedEvent[] = useMemo(() => {
    const availableColors: BarColor[] = ["yellow", "blue", "green", "purple", "orange", "pink"];
    const usedColors = new Set<BarColor>();
    
    return events.map((e, index) => {
      // 이미 사용된 색상 제외하고 순환적으로 할당
      let colorIndex = index;
      while (usedColors.has(availableColors[colorIndex % availableColors.length])) {
        colorIndex++;
      }
      const selectedColor = availableColors[colorIndex % availableColors.length];
      usedColors.add(selectedColor);
      
      return {
        startDay: Number(e.startDate.slice(8, 10)),
        endDay: Number(e.endDate.slice(8, 10)),
        label: merchantNameMap.get(e.merchantId) ?? "가맹점",
        singleDay: e.startDate === e.endDate,
        color: selectedColor,
      };
    });
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
    () => buildSegments({ year, month, events: normalized, originalEvents: events }),
    [year, month, normalized, events]
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
                <View style={s.dayWrap}>
                  <View style={[s.dayCircle, isSelected && s.dayCircleSel]}>
                    <Text style={[s.day, isSelected && s.daySel]}>{day}</Text>
                  </View>
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
            const baseTop =
              seg.row * CELL_H + CELL_PAD_Y + DAY_LINE_H + BAR_BASE_GAP;
            // lane별로 색상 오프셋을 고려한 위치 계산
            // lane 0이 가장 위, lane 1이 그 아래, 여백 없이 바로 붙어서
            const colorOffset = COLOR_TOP_OFFSET[seg.color];
            const laneOffset = seg.lane * LANE_GAP; // lane 0=0, lane 1=14, lane 2=28...
            const top = Math.round(baseTop + colorOffset + laneOffset);

            // 색상별 배경색과 텍스트 색상 매핑
            const getColorConfig = (color: BarColor) => {
              switch (color) {
                case "yellow":
                  return { bg: colors.YELLOW_LIGHT, text: colors.BLUE_DARKER };
                case "blue":
                  return { bg: colors.BLUE_NORMAL, text: "#fff" };
                case "green":
                  return { bg: colors.GRAY_LIGHT, text: colors.BLUE_DARKER };
                case "purple":
                  return { bg: colors.BLUE_LIGHT, text: colors.BLUE_DARKER };
                case "orange":
                  return { bg: colors.YELLOW_NORMAL, text: colors.BLUE_DARKER };
                case "pink":
                  return { bg: colors.GRAY_NORMAL, text: "#fff" };
                default:
                  return { bg: colors.BLUE_NORMAL, text: "#fff" };
              }
            };
            
            const { bg, text: labelColor } = getColorConfig(seg.color);

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
const CIRCLE = 28;
const s = StyleSheet.create({
  wrap: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: colors.BLUE_LIGHT_ACTIVE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  // ▼ 월 전환
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  navBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "transparent",
    marginHorizontal: 6,
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
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 0,
  },

  dayCircle: {
    minWidth: CIRCLE,
    aspectRatio: 1, // 가로=세로
    borderRadius: CIRCLE / 2,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  dayCircleSel: {
    backgroundColor: colors.BLUE_LIGHT,
    // 혹시 기기에 따라 borderRadius가 덮이는 이슈가 있으면 안전빵:
    borderRadius: 9999,
  },
  day: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: colors.BLUE_DARK_ACTIVE,
    textAlign: "center",
  },
  daySel: {
    color: colors.BLUE_DARKER, // 진한 배경이면 "#fff"로
  },

  // ▼ 형광펜 막대
  bar: {
    position: "absolute",
    height: BAR_HEIGHT,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  barLabel: {
    width: "100%",
    textAlign: "center",
    fontSize: 10,
    ...font.bold,
    includeFontPadding: false,
  },
});
