import React, { memo } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import CategoryCard from "~features/Budget/ui/molecules/CategoryCard";
import type { CategoryGridProps, CategoryItem } from "./types";

function CategoryGrid({
  items,
  selectedKeys,
  onToggle,
  numColumns = 3,
  gap = 12,
}: CategoryGridProps) {
  const cellWidthPercent = 100 / numColumns;
  
  // 아이템들을 행별로 그룹화
  const rows: CategoryItem[][] = [];
  for (let i = 0; i < items.length; i += numColumns) {
    rows.push(items.slice(i, i + numColumns));
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingVertical: gap / 2 }}
      showsVerticalScrollIndicator={false}
    >
      {rows.map((row, rowIndex) => (
        <View 
          key={rowIndex} 
          style={[
            styles.row, 
            { 
              paddingHorizontal: gap / 2,
              marginBottom: rowIndex === rows.length - 1 ? 0 : gap
            }
          ]}
        >
          {row.map((item) => {
            const selected = selectedKeys.includes(item.key);
            return (
              <View key={item.key} style={[styles.cell, { width: `${cellWidthPercent}%`, padding: gap / 2 }]}>
                <CategoryCard
                  name={item.key}
                  label={item.label}
                  icon={item.icon}
                  selected={selected}
                  disabled={item.disabled}
                  onPress={onToggle}
                />
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

export default memo(CategoryGrid);

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: 'row',
  },
  cell: {},
});
