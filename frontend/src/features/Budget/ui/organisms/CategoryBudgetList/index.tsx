import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import {
  CATEGORY_ICON_BY_NAME,
  type CategoryName,
} from "@/shared/constants/categoryIcons";
import CategoryBudgetRow from "@/features/Budget/ui/molecules/CategoryBudgetRow";
import type { CategoryBudgetListProps } from "./types";

export default function CategoryBudgetList({
  items,
  onChangeItem,
  disabled,
  getIcon = (n: CategoryName) => CATEGORY_ICON_BY_NAME[n],
  getLabel = (n: CategoryName) => n,
  gap = 12,
}: CategoryBudgetListProps) {
  // 부모 ScrollView를 사용하므로 자체 스크롤 비활성화
  const content = (
    <View style={[styles.list, { gap }]}>
      {items.map(({ name, amount }) => (
        <CategoryBudgetRow
          key={name}
          name={name}
          label={getLabel(name)}
          icon={getIcon(name)}
          amount={amount}
          disabled={disabled}
          onChangeAmount={
            onChangeItem ? (v) => onChangeItem(name, v) : undefined
          }
        />
      ))}
    </View>
  );

  return content;
}

const styles = StyleSheet.create({
  list: {
    width: "100%",
  },
});
