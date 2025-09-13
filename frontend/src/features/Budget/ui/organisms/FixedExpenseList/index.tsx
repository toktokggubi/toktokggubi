import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import FixedExpenseRow from "~features/Budget/ui/molecules/FixedExpenseRow";
import type { FixedExpenseListProps } from "./types";
import { listHeaderLabel } from "./variants";

const HEADER_HEIGHT = 44;

export default function FixedExpenseList({
  items,
  onPressItem,
  onPressAdd,
  showHeader = true,
}: FixedExpenseListProps) {
  return (
    <View>
      {showHeader && (
        <View style={s.headerBar}>
          {/* 항목명 */}
          <View style={[s.headerCellWrap, s.colName]}>
            <Text style={s.headerCellText}>{listHeaderLabel.name}</Text>
          </View>
          {/* 금액 */}
          <View style={[s.headerCellWrap, s.colAmount]}>
            <Text style={[s.headerCellText, s.amountText]}>
              {listHeaderLabel.amount}
            </Text>
          </View>
          {/* 예산 포함 */}
          <View style={[s.headerCellWrap, s.colInclude, s.noDivider]}>
            <Text style={s.headerCellText}>{listHeaderLabel.include}</Text>
          </View>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <FixedExpenseRow item={item} onPress={onPressItem} />
        )}
        ListFooterComponent={
          <Pressable
            onPress={onPressAdd}
            style={s.addRow}
            accessibilityLabel="항목 추가"
          >
            <Text style={s.addText}>＋</Text>
          </Pressable>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  /* 🔹 파란 바 형태의 헤더 컨테이너 */
  headerBar: {
    height: HEADER_HEIGHT,
    backgroundColor: colors.BLUE_NORMAL,
    borderRadius: 10,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 6,
  },

  /* 🔹 칸(Cell) 래퍼: 세로 중앙, 오른쪽 구분선 */
  headerCellWrap: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    // 파란 배경 위에서 은은한 구분선: 흰색 30% 정도
    borderRightColor: "rgba(255,255,255,0.3)",
  },
  noDivider: { borderRightWidth: 0 }, // 마지막 칸은 구분선 제거

  /* 🔹 칸별 너비 비율 (디자인 감으로 튜닝) */
  colName: { flex: 1.1 }, // 항목명 조금 더 넓게
  colAmount: { flex: 0.9 }, // 금액
  colInclude: { width: 78 }, // 체크박스 칸은 고정폭

  /* 🔹 텍스트 스타일 */
  headerCellText: {
    color: "#fff",
    ...font.bold,
    fontSize: 13,
    textAlign: "center",
  },
  amountText: {
    textAlign: "center",
    width: "100%",
  },

  /* 기존 + 버튼 */
  addRow: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.BLUE_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginTop: 2,
  },
  addText: { fontSize: 20, color: colors.BLUE_NORMAL },
});
