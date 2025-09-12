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
  // 5개 이상일 때 스크롤 가능하도록 설정
  const shouldScroll = items.length > 5;
  const maxHeight = shouldScroll ? 5 * (64 + gap) - gap : undefined; // 5개 아이템 높이 + 간격

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

  if (shouldScroll) {
    return (
      <ScrollView
        style={[styles.scrollContainer, { maxHeight }]}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  list: {
    width: "100%",
  },
  scrollContainer: {
    width: "100%",
  },
});
