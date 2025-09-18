import React from "react";
import { View, StyleSheet } from "react-native";
import { HomeTemplate } from "../templates/HomeTemplate";
import { colors } from "@/shared/constants/colors";

// 임시 데이터 - 실제로는 API에서 가져올 데이터
const mockData = {
  totalBudget: {
    currentAmount: 40000,
    totalAmount: 500000,
  },
  availableAmount: 460000,
  characterMessage: "아직은 넉넉하다꺼비",
  categoryBudgets: [
    { category: "food" as const, currentAmount: 10000, totalAmount: 30000 },
    { category: "cafe_snack" as const, currentAmount: 5000, totalAmount: 20000 },
    { category: "transport" as const, currentAmount: 15000, totalAmount: 25000 },
    { category: "life" as const, currentAmount: 8000, totalAmount: 15000 },
    { category: "shopping" as const, currentAmount: 2000, totalAmount: 10000 },
  ],
  transactions: {
    food: [
      { id: "1", merchantName: "맥도날드", category: "food" as const, paymentMethod: "삼성카드", amount: -8500, date: "12/15" },
      { id: "2", merchantName: "김밥천국", category: "food" as const, paymentMethod: "신한카드", amount: -1500, date: "12/14" },
    ],
    cafe_snack: [
      { id: "3", merchantName: "스타벅스", category: "cafe_snack" as const, paymentMethod: "신한카드", amount: -4500, date: "12/15" },
      { id: "4", merchantName: "투썸플레이스", category: "cafe_snack" as const, paymentMethod: "네이버페이", amount: -500, date: "12/13" },
    ],
    transport: [
      { id: "5", merchantName: "지하철", category: "transport" as const, paymentMethod: "교통카드", amount: -15000, date: "12/15" },
    ],
    life: [
      { id: "6", merchantName: "다이소", category: "life" as const, paymentMethod: "네이버페이 카드", amount: -2000, date: "12/14" },
      { id: "7", merchantName: "이마트", category: "life" as const, paymentMethod: "현대카드", amount: -6000, date: "12/12" },
    ],
    shopping: [
      { id: "8", merchantName: "쿠팡", category: "shopping" as const, paymentMethod: "삼성카드", amount: -2000, date: "12/11" },
    ],
  },
};

export const HomeScreen: React.FC = () => {
  const handleTotalBudgetPress = () => {
    console.log("전체 예산 상세 보기");
    // TODO: 전체 예산 상세 화면으로 이동
  };

  const handleCategoryPress = (category: string) => {
    console.log("카테고리 상세 보기:", category);
    // TODO: 카테고리별 거래 내역 화면으로 이동
  };

  return (
    <View style={styles.container}>
      <HomeTemplate
        totalBudget={mockData.totalBudget}
        availableAmount={mockData.availableAmount}
        characterMessage={mockData.characterMessage}
        categoryBudgets={mockData.categoryBudgets}
        transactions={mockData.transactions}
        onTotalBudgetPress={handleTotalBudgetPress}
        onCategoryPress={handleCategoryPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_PRIMARY,
  },
});
