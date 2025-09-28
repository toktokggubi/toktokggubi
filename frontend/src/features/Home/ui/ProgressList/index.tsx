import { Category } from "@/shared/constants/categories";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ProgressRow } from "../ProgressRow";
import { TransactionList } from "../TransactionList";
import { ProgressListProps } from "./types";

export const ProgressList: React.FC<ProgressListProps> = ({
  categoryBudgets,
  onCategoryPress,
  title,
  transactions = {},
  onEditPress,
}) => {
  const [expandedCategory, setExpandedCategory] = useState<Category | null>(
    null
  );

  // 예산 크기 순으로 정렬된 카테고리 배열 (내림차순)
  const sortedCategoryBudgets = [...categoryBudgets].sort(
    (a, b) => b.totalAmount - a.totalAmount
  );

  const handleUsageDetailsPress = (category: Category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const handleCategoryPress = (category: Category) => {
    // 카테고리 클릭 시 토글 처리
    setExpandedCategory(expandedCategory === category ? null : category);
    // 기존 onCategoryPress도 호출 (필요한 경우)
    onCategoryPress?.(category);
  };

  return (
    <View style={styles.container}>
      {/* 제목과 연필 버튼 */}
      {title && (
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {onEditPress && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={onEditPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="pencil" size={20} color={colors.BLUE_NORMAL} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* 카테고리별 예산 리스트 */}
      <View style={styles.listContent}>
        {sortedCategoryBudgets.length > 0 ? (
          sortedCategoryBudgets.map((item, index) => {
            const isExpanded = expandedCategory === item.category;
            const categoryTransactions = transactions[item.category] || [];

            return (
              <View key={item.category}>
                <ProgressRow
                  type="category"
                  category={item.category}
                  currentAmount={item.currentAmount}
                  totalAmount={item.totalAmount}
                  onPress={() => handleCategoryPress(item.category)}
                  isExpanded={isExpanded}
                  onUsageDetailsPress={() =>
                    handleUsageDetailsPress(item.category)
                  }
                />

                {/* 토글된 거래 내역 */}
                {isExpanded && categoryTransactions.length > 0 && (
                  <View style={styles.transactionContainer}>
                    <TransactionList
                      transactions={categoryTransactions}
                      onTransactionPress={(transaction) => {}}
                    />
                  </View>
                )}

                {/* 구분선 */}
                {index < sortedCategoryBudgets.length - 1 && (
                  <View style={styles.separator} />
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              카테고리별 예산 데이터가 없습니다.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    paddingHorizontal: 12,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 18,
    lineHeight: 20,
    ...font.bold,
    color: colors.BLUE_DARKER,
    flex: 1,
  },
  editButton: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: colors.BLUE_LIGHT,
  },
  listContent: {
    paddingBottom: 8,
    paddingLeft: 0,
  },
  separator: {
    height: 4,
  },
  transactionContainer: {
    marginTop: 4,
    marginBottom: 4,
    paddingLeft: 8,
    width: "100%",
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: colors.GRAY_NORMAL,
    textAlign: "center",
  },
});
