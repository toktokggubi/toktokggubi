import React from "react";
import { View, Text, Pressable, StyleSheet, FlatList } from "react-native";
import { colors } from "@/shared/constants/colors";
import FixedExpenseRow from "~features/Budget/ui/molecules/FixedExpenseRow";
import type { FixedExpenseListProps } from "./types";
import { listHeaderLabel } from "./variants";

export default function FixedExpenseList({
  items,
  onPressItem,
  onPressAdd,
  showHeader = true,
}: FixedExpenseListProps) {
  return (
    <View>
      {showHeader && (
        <View style={s.headerRow}>
          <Text style={[s.headerCell, { flex: 1 }]}>
            {listHeaderLabel.name}
          </Text>
          <Text style={[s.headerCell, { width: 110, textAlign: "right" }]}>
            {listHeaderLabel.amount}
          </Text>
          <Text style={[s.headerCell, { width: 60, textAlign: "center" }]}>
            {listHeaderLabel.include}
          </Text>
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
  headerRow: { flexDirection: "row", paddingHorizontal: 12, marginBottom: 6 },
  headerCell: { color: colors.BLUE_NORMAL, fontWeight: "700" },
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
