import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import React, { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { FixedExpenseRowProps } from "./types";
import { nameMaxLines, rowHeights } from "./variants";

function FixedExpenseRowImpl({ item, onPress }: FixedExpenseRowProps) {
  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [s.row, pressed && { opacity: 0.9 }]}
      accessibilityRole="button"
      accessibilityLabel={`${item.name} ${item.amount}원 상세 편집`}
    >
      {/* 항목명 */}
      <View style={[s.cellWrap, s.colName]}>
        <Text style={[s.cellText]} numberOfLines={nameMaxLines}>
          {item.name}
        </Text>
      </View>

      {/* 금액 */}
      <View style={[s.cellWrap, s.colAmount]}>
        <Text style={[s.cellText]}>{item.amount.toLocaleString()}원</Text>
      </View>

      {/* 예산 포함 */}
      <View style={[s.cellWrap, s.colInclude, s.noDivider]}>
        <View style={[s.checkbox, item.includeInBudget && s.checkboxOn]}>
          {item.includeInBudget ? <Text style={s.check}>✓</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

export default memo(FixedExpenseRowImpl);

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: rowHeights,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.BLUE_LIGHT,
    borderRadius: 10,
    overflow: "hidden",
  },

  // ✅ 공통 셀 래퍼: 가로·세로 중앙 + 얇은 세로 구분선
  cellWrap: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: "rgba(0,0,0,0.06)",
  },
  noDivider: { borderRightWidth: 0 },

  // ✅ 헤더와 동일한 컬럼 규격
  colName: { flex: 1.1 },
  colAmount: { flex: 0.9 },
  colInclude: { width: 80 },

  // ✅ 텍스트 중앙 정렬
  cellText: {
    color: "#111",
    fontSize: 14,
    textAlign: "center",
    width: "100%",
  },

  // 체크박스
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.BLUE_NORMAL,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: { backgroundColor: colors.BLUE_NORMAL },
  check: { 
    color: "#fff", 
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 16,
    textAlign: "center",
  },
});
