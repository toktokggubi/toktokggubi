import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { HomeTemplate } from "../templates/HomeTemplate";
import { colors } from "@/shared/constants/colors";
import { HomeData } from "../templates/HomeTemplate/types";

// 임시 데이터 - 실제로는 API에서 가져올 데이터
const mockData: HomeData = {
  totalBudget: {
    currentAmount: 40000,
    totalAmount: 500000,
  },
  availableAmount: 460000,
  characterMessage: "아직은 넉넉하다꺼비",
  month: "12월",
  listTitle: "카테고리별 사용현황",
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
  // API 연동을 위한 상태 관리
  const [data, setData] = useState<HomeData>(mockData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadHomeData();
  }, []);

  // API 호출 함수 (나중에 실제 API로 교체)
  const loadHomeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: 실제 API 호출로 교체
      // const response = await homeApi.getHomeData();
      // setData(response.data);
      
      // 현재는 mockData 사용
      await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 시뮬레이션
      setData(mockData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

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
        totalBudget={data.totalBudget}
        availableAmount={data.availableAmount}
        characterMessage={data.characterMessage}
        categoryBudgets={data.categoryBudgets}
        transactions={data.transactions}
        month={data.month}
        listTitle={data.listTitle}
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
