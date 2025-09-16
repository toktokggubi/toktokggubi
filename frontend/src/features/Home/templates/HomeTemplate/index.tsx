import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { HomeTemplateProps } from "./types";
import { ProgressRow } from "../../ui/ProgressRow";
import { CharacterBackground } from "../../ui/CharacterBackground";
import { ProgressList } from "../../ui/ProgressList";
import { colors } from "@/shared/constants/colors";
import { krw } from "@/shared/utils/currency";

export const HomeTemplate: React.FC<HomeTemplateProps> = ({
  totalBudget,
  availableAmount,
  characterMessage = "아직은 넉넉하다꺼비",
  categoryBudgets,
  transactions = {},
  onTotalBudgetPress,
  onCategoryPress,
}) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 전체 예산 섹션 */}
      <View style={styles.budgetSection}>
        <ProgressRow
          type="total"
          currentAmount={totalBudget.currentAmount}
          totalAmount={totalBudget.totalAmount}
          onPress={onTotalBudgetPress}
        />
        
        {/* 사용가능금액 */}
        <View style={styles.availableAmountContainer}>
          <Text style={styles.availableAmountLabel}>사용가능금액</Text>
          <Text style={styles.availableAmountValue}>{krw(availableAmount)}</Text>
        </View>
      </View>

      {/* 캐릭터 배경 */}
      <CharacterBackground message={characterMessage} />

      {/* 카테고리별 사용현황 */}
      <ProgressList
        categoryBudgets={categoryBudgets}
        transactions={transactions}
        onCategoryPress={onCategoryPress}
        title="카테고리별 사용현황"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_PRIMARY,
  },
  budgetSection: {
    paddingTop: 16,
    paddingBottom: 4,
  },
  availableAmountContainer: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  availableAmountLabel: {
    fontSize: 13,
    color: colors.GRAY_NORMAL,
    marginBottom: 3,
  },
  availableAmountValue: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.GRAY_DARKER,
  },
});
