import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { ProgressRow } from "../ProgressRow";
import { TransactionList } from "../TransactionList";
import { ProgressListProps, CategoryBudget, Transaction } from "./types";
import { colors } from "@/shared/constants/colors";
import { Category } from "@/shared/constants/categories";

export const ProgressList: React.FC<ProgressListProps> = ({
  categoryBudgets,
  onCategoryPress,
  title = "카테고리별 사용현황",
  transactions = {},
}) => {
  const [expandedCategory, setExpandedCategory] = useState<Category | null>(null);

  const handleUsageDetailsPress = (category: Category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const renderCategoryBudget = ({ item }: { item: CategoryBudget }) => {
    const isExpanded = expandedCategory === item.category;
    const categoryTransactions = transactions[item.category] || [];

    return (
      <View>
        <ProgressRow
          type="category"
          category={item.category}
          currentAmount={item.currentAmount}
          totalAmount={item.totalAmount}
          onPress={() => onCategoryPress?.(item.category)}
          isExpanded={isExpanded}
          onUsageDetailsPress={() => handleUsageDetailsPress(item.category)}
        />
        
        {/* 토글된 거래 내역 */}
        {isExpanded && categoryTransactions.length > 0 && (
          <View style={styles.transactionContainer}>
            <TransactionList
              transactions={categoryTransactions}
              onTransactionPress={(transaction) => console.log("거래 내역 클릭:", transaction)}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 제목 */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* 카테고리별 예산 리스트 */}
      <FlatList
        data={categoryBudgets}
        renderItem={renderCategoryBudget}
        keyExtractor={(item) => item.category}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  titleContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.GRAY_DARKER,
  },
  listContent: {
    paddingBottom: 8,
  },
  separator: {
    height: 4,
  },
  transactionContainer: {
    marginTop: 4,
    marginBottom: 4,
  },
});
