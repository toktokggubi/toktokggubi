import { Category } from "@/shared/constants/categories";
import { colors } from "@/shared/constants/colors";
import { useAuthGuard } from "@/shared/hooks/useAuthGuard";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useBudgetStatusQuery } from "~features/Budget/model/useBudgetStatusQuery";
import {
  fetchBudgetCategory,
  fetchBudgetTotal,
  fetchMonthlyCategoryList,
  fetchMonthlySummary,
  fetchMonthlySummaryByCategory,
} from "../api/fetchers";
import { HomeTemplate } from "../templates/HomeTemplate";
import {
  CategoryBudget,
  HomeData,
  Transaction,
} from "../templates/HomeTemplate/types";

// 헬퍼 함수들
const getCategoryNameById = (categoryId: number): Category => {
  // 실제 데이터베이스 카테고리 ID와 매핑
  const categoryMap: Record<number, Category> = {
    1: "food", // 식비
    2: "cafe_snack", // 카페/간식
    3: "alcohol_entertain", // 술/유흥
    4: "life", // 생활
    5: "shopping", // 쇼핑
    6: "beauty", // 뷰티/미용
    7: "transport", // 교통
    8: "car", // 자동차
    9: "health", // 의료/건강
    10: "culture", // 문화
    11: "life", // 기타 (기본값으로 life 사용)
  };
  return categoryMap[categoryId] || "life";
};

const getCategoryIdByName = (categoryName: Category): number => {
  // 카테고리 이름을 실제 데이터베이스 ID로 매핑
  const categoryMap: Record<Category, number> = {
    food: 1, // 식비
    cafe_snack: 2, // 카페/간식
    alcohol_entertain: 3, // 술/유흥
    life: 4, // 생활
    shopping: 5, // 쇼핑
    beauty: 6, // 뷰티/미용
    transport: 7, // 교통
    car: 8, // 자동차
    health: 9, // 의료/건강
    culture: 10, // 문화
  };
  return categoryMap[categoryName] || 1;
};

const getCharacterMessage = (
  currentAmount: number,
  totalAmount: number
): string => {
  const usageRate = (currentAmount / totalAmount) * 100;

  if (usageRate < 30) {
    return "아직은 넉넉하다꺼비";
  } else if (usageRate < 60) {
    return "적당히 쓰고 있다꺼비";
  } else if (usageRate < 80) {
    return "조금 조심해야겠다꺼비";
  } else {
    return "이제 정말 조심해야겠다꺼비";
  }
};

const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getMonth() + 1}월`;
};

export const HomeScreen: React.FC = () => {
  const router = useRouter();

  // 인증 가드
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard();

  // API 연동을 위한 상태 관리
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // 예산 설정 여부 확인
  const budgetStatusQuery = useBudgetStatusQuery();

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadHomeData();
  }, []);

  // budgetStatusQuery 상태가 변경될 때마다 데이터 로드
  useEffect(() => {
    if (!budgetStatusQuery.isLoading) {
      loadHomeData();
    }
  }, [
    budgetStatusQuery.isLoading,
    budgetStatusQuery.error,
    budgetStatusQuery.data,
  ]);

  // API 호출 함수
  const loadHomeData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // 예산 설정 여부 확인
      if (
        budgetStatusQuery.error ||
        !budgetStatusQuery.data ||
        budgetStatusQuery.data.totalAmount === 0
      ) {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
        return;
      }

      // 예산 관련 API 호출 - 개별적으로 에러 처리
      let budgetTotalResponse,
        budgetCategoryResponse,
        monthlySummaryResponse,
        monthlySummaryByCategoryResponse,
        monthlyCategoryListResponse;

      try {
        budgetTotalResponse = await fetchBudgetTotal();
      } catch (err) {
        throw err;
      }

      try {
        budgetCategoryResponse = await fetchBudgetCategory();
      } catch (err) {
        throw err;
      }

      try {
        // 테스트를 위해 2025년 9월 데이터 조회
        monthlySummaryResponse = await fetchMonthlySummary({
          from: "20250901",
          to: "20250930",
        });
      } catch (err) {
        throw err;
      }

      try {
        monthlySummaryByCategoryResponse =
          await fetchMonthlySummaryByCategory();
      } catch (err) {
        throw err;
      }

      try {
        monthlyCategoryListResponse = await fetchMonthlyCategoryList();
      } catch (err) {
        throw err;
      }

      // 카테고리별 예산 데이터 변환
      const categoryBudgets: CategoryBudget[] = budgetCategoryResponse.map(
        (budget: { categoryId: number; finalAmount: number }) => {
          // 카테고리 ID를 카테고리 이름으로 매핑
          const categoryName = getCategoryNameById(budget.categoryId);
          return {
            category: categoryName,
            currentAmount: 0, // 실제 사용 금액은 거래 내역에서 계산
            totalAmount: budget.finalAmount,
          };
        }
      );

      // 거래 내역에서 카테고리별 사용 금액 계산
      const categoryUsageMap = new Map<number, number>();
      if (monthlySummaryByCategoryResponse.categories) {
        monthlySummaryByCategoryResponse.categories.forEach(
          (category: { categoryId: number; amount: number }) => {
            categoryUsageMap.set(category.categoryId, category.amount);
          }
        );
      }

      // 카테고리별 예산에 실제 사용 금액 업데이트
      const updatedCategoryBudgets = categoryBudgets.map((budget) => {
        const categoryId = getCategoryIdByName(budget.category);
        const currentAmount = categoryUsageMap.get(categoryId) || 0;
        return {
          ...budget,
          currentAmount,
        };
      });

      // 거래 내역 데이터 변환
      const transactions: Partial<Record<Category, Transaction[]>> = {};
      if (monthlyCategoryListResponse.categories) {
        monthlyCategoryListResponse.categories.forEach(
          (category: {
            categoryId: number;
            transactions: Array<{
              transactionUniqueNo: string;
              merchantName: string;
              cardName: string;
              amount: number;
              dateTime: string;
            }>;
          }) => {
            const categoryName = getCategoryNameById(category.categoryId);
            transactions[categoryName] = category.transactions.map(
              (transaction: {
                transactionUniqueNo: string;
                merchantName: string;
                cardName: string;
                amount: number;
                dateTime: string;
              }) => ({
                id: transaction.transactionUniqueNo,
                merchantName: transaction.merchantName,
                category: categoryName,
                paymentMethod: transaction.cardName,
                amount: transaction.amount,
                date: transaction.dateTime,
              })
            );
          }
        );
      }

      // HomeData 형식으로 변환
      const homeData: HomeData = {
        totalBudget: {
          currentAmount: monthlySummaryResponse.totalAmount,
          totalAmount: budgetTotalResponse.totalAmount,
        },
        availableAmount:
          budgetTotalResponse.totalAmount - monthlySummaryResponse.totalAmount,
        characterMessage: getCharacterMessage(
          monthlySummaryResponse.totalAmount,
          budgetTotalResponse.totalAmount
        ),
        month: getCurrentMonth(),
        listTitle: "카테고리별 사용현황",
        categoryBudgets: updatedCategoryBudgets,
        transactions: transactions,
      };

      setData(homeData);
    } catch (error: any) {
      setError(
        error instanceof Error
          ? error.message
          : "데이터를 불러오는데 실패했습니다."
      );
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleTotalBudgetPress = () => {
    // TODO: 전체 예산 상세 화면으로 이동
  };

  const handleCategoryPress = (category: string) => {
    // TODO: 카테고리별 거래 내역 화면으로 이동
  };

  const handleBudgetEditPress = () => {
    router.push("/budget/edit" as any);
  };

  const handleBudgetSetup = () => {
    router.push("/budget");
  };

  const handleRefresh = () => {
    loadHomeData(true);
  };

  const handleNotificationPress = () => {
    router.push("/notification");
  };

  // 인증 로딩 중이거나 인증되지 않은 경우
  if (authLoading || !isAuthenticated) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.BLUE_NORMAL} />
        <Text style={styles.loadingText}>
          {authLoading ? "인증 확인 중..." : "로그인 페이지로 이동 중..."}
        </Text>
      </View>
    );
  }

  // 예산 설정 여부 확인
  const hasBudget =
    !budgetStatusQuery.isError ||
    (budgetStatusQuery.error?.message !== "BUDGET_NOT_SET" &&
      budgetStatusQuery.error?.message !== "BUDGET_NOT_FOUND");

  return (
    <View style={styles.container}>
      <HomeTemplate
        totalBudget={data?.totalBudget || { currentAmount: 0, totalAmount: 0 }}
        availableAmount={data?.availableAmount || 0}
        characterMessage={data?.characterMessage || "아직은 넉넉하다꺼비"}
        categoryBudgets={data?.categoryBudgets || []}
        transactions={data?.transactions || {}}
        month={data?.month || "12월"}
        listTitle={data?.listTitle || "카테고리별 사용현황"}
        onTotalBudgetPress={handleTotalBudgetPress}
        onCategoryPress={handleCategoryPress}
        onBudgetSetup={handleBudgetSetup}
        onBudgetEditPress={handleBudgetEditPress}
        onNotificationPress={handleNotificationPress}
        hasBudget={hasBudget}
        loading={loading}
        error={error}
        onRetry={loadHomeData}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_PRIMARY,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.GRAY_DARK,
  },
  testButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: colors.BLUE_NORMAL,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 1000,
  },
  testButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
