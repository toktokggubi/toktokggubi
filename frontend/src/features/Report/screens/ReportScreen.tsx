// frontend/src/features/Report/screens/ReportScreen.tsx
import { fetchNotifications } from "@/features/Notification/api/notificationApi";
import { useAuthGuard } from "@/shared/hooks/useAuthGuard";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState, useEffect } from "react";
import { Alert, ActivityIndicator, View, TouchableOpacity, Text } from "react-native";
import * as SecureStore from "expo-secure-store";
import LoadingOverlay from "@/shared/ui/LoadingOverlay";
import { ExpenseReportTemplate } from "../templates/ExpenseReportTemplate";
import { NoReportScreen } from "../ui/NoReportScreen";
import type {
  DailyPaymentData,
  PaymentDetail,
  VIPStore,
} from "../templates/ExpenseReportTemplate/types";
import type { AnomalyData } from "../ui/AnomalyMap/types";
import type { DonutChartData } from "../ui/ExpenseDonutChart/types";
import { fetchCurrentUserReport } from "../api/reportApi";
import { useProfileQuery } from "@/features/Auth/model/useAuthQueries";
import type { UserReportResponse } from "../api/reportApi";
import {
  fetchFixedIncludedTotal,
  fetchFixedExpenseList,
} from "@/features/Budget/api/fetchers";
import { colors } from "@/shared/constants/colors";


export default function ReportScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard();
  const { data: profile, isLoading: profileLoading } = useProfileQuery();

  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(8); // 9월 - 1 = 8월
  const [expenseData, setExpenseData] = useState<DonutChartData[]>([]);
  const [reportData, setReportData] = useState<UserReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [fixedExpenseAmount, setFixedExpenseAmount] = useState(0);
  const [variableExpenseAmount, setVariableExpenseAmount] = useState(0);

  // 토큰 존재 여부 확인 (간단한 검증)
  const validateToken = useCallback(async () => {
    try {
      const accessToken = await SecureStore.getItemAsync("access_token");
      const refreshToken = await SecureStore.getItemAsync("refresh_token");


      if (!accessToken || !refreshToken) {
        setIsTokenValid(false);
        return false;
      }

      setIsTokenValid(true);
      return true;
    } catch (error) {
      setIsTokenValid(false);
      return false;
    }
  }, []);

  // API 데이터 가져오기 (http 인터셉터에서 401 처리)
  const fetchReportData = useCallback(async () => {
    if (!profile?.userId) return;

    // 토큰 존재 여부 확인
    const hasToken = await validateToken();
    if (!hasToken) {
      router.replace("/auth/login");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 리포트 데이터와 고정지출 데이터를 병렬로 가져오기
      const [data, fixedExpenseResponse] = await Promise.all([
        fetchCurrentUserReport(currentYear, currentMonth),
        fetchFixedIncludedTotal().catch(() => ({ fixedIncludedTotal: 0 })),
      ]);

      setReportData(data);
      setRetryCount(0); // 성공 시 재시도 카운트 리셋

      // 고정지출 금액 설정
      const fixedAmount = fixedExpenseResponse.fixedIncludedTotal || 0;
      setFixedExpenseAmount(fixedAmount);

      // 변동지출 금액 계산 (총 지출 - 고정지출)
      const totalSpending =
        data.summaryReport.monthlySpendingSummary?.totalSpending || 0;
      const variableAmount = Math.max(0, totalSpending - fixedAmount);
      setVariableExpenseAmount(variableAmount);

      // API 데이터를 차트 데이터로 변환 (금액 순으로 정렬 후 색상 매칭)
      const sortedCategories = [...data.summaryReport.spendingByCategory].sort(
        (a, b) => b.amount - a.amount
      );
      
      const chartColors = [
        colors.BLUE_LIGHT,
        colors.BLUE_LIGHT_HOVER,
        colors.BLUE_LIGHT_ACTIVE,
        colors.BLUE_NORMAL,
        colors.BLUE_NORMAL_HOVER,
        colors.BLUE_NORMAL_ACTIVE,
        colors.BLUE_DARK,
        colors.BLUE_DARK_HOVER,
        colors.BLUE_DARK_ACTIVE,
        colors.BLUE_DARKER,
        colors.YELLOW_LIGHT,
        colors.YELLOW_LIGHT_HOVER,
        colors.YELLOW_LIGHT_ACTIVE,
        colors.YELLOW_NORMAL,
        colors.GRAY_LIGHT,
        colors.GRAY_LIGHT_HOVER,
        colors.GRAY_LIGHT_ACTIVE,
        colors.GRAY_NORMAL,
        colors.GRAY_NORMAL_HOVER,
        colors.GRAY_NORMAL_ACTIVE,
        colors.GRAY_DARK,
        colors.GRAY_DARK_HOVER,
        colors.GRAY_DARK_ACTIVE,
        colors.GRAY_DARKER,
      ];
      
      const chartData: DonutChartData[] = sortedCategories.map((item, index) => ({
        label: item.category,
        value: item.amount,
        color: chartColors[index % chartColors.length],
        percentage: item.percentage,
      }));
      setExpenseData(chartData);
    } catch (err: any) {
      // 토큰 갱신 실패로 인한 에러인 경우 로그인 페이지로 이동
      if (
        err?.message === "NO_REFRESH_TOKEN" ||
        err?.message === "NO_ACCESS_FROM_REFRESH"
      ) {
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
        router.replace("/auth/login");
        return;
      }

      // 이전 달 데이터가 없는 경우 처리
      const errorMessage = err?.response?.data?.message || err?.message || "";
      const statusCode = err?.response?.status;
      const errorData = err?.response?.data;
      
      // 토큰 갱신 후에도 401이 발생하면 데이터가 없는 것으로 간주
      const isDataNotFound = 
        statusCode === 404 ||
        (statusCode === 401 && (
          // 에러 메시지가 없거나 비어있는 경우 (백엔드에서 데이터 없음을 401로 반환)
          !errorData || 
          Object.keys(errorData).length === 0 ||
          errorMessage.includes("데이터가 없습니다") ||
          errorMessage.includes("거래 내역이 없습니다") ||
          errorMessage.includes("리포트를 생성할 수 없습니다") ||
          errorMessage.includes("사용자 데이터가 없습니다")
        )) ||
        errorMessage.includes("데이터가 없습니다") ||
        errorMessage.includes("거래 내역이 없습니다") ||
        errorMessage.includes("리포트를 생성할 수 없습니다");
      
      if (isDataNotFound) {
        setReportData(null); // 리포트 데이터를 null로 설정하여 NoReportScreen이 표시되도록 함
        setError(null); // 에러 상태를 초기화
        return;
      }

      // 일반적인 401 에러 (토큰 문제)는 로그인 페이지로 이동
      if (statusCode === 401) {
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
        router.replace("/auth/login");
        return;
      }

      setError(
        errorMessage || "리포트 데이터를 불러오는데 실패했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }, [profile?.userId, currentYear, currentMonth, validateToken, router]);

  // 프로필이 로드되면 리포트 데이터 가져오기
  useEffect(() => {
    if (profile?.userId) {
      fetchReportData();
    }
  }, [fetchReportData]);

  // 총 지출 금액 계산 (API 데이터 우선, 없으면 차트 데이터 합계)
  const totalAmount =
    reportData?.summaryReport.monthlySpendingSummary.totalSpending ||
    expenseData.reduce((sum, item) => sum + item.value, 0);

  // API 데이터에서 이상탐지 데이터 변환 (지오코딩은 AnomalyMap 컴포넌트에서 처리)
  const anomalyData: AnomalyData[] =
    reportData?.summaryReport.abnormalSpending.transactions.map(
      (transaction, index) => ({
        id: index.toString(),
        storeName: transaction.location || "알 수 없는 매장",
        amount: transaction.amount,
        date: transaction.date,
        latitude: 0, // 지오코딩으로 프론트엔드에서 처리
        longitude: 0, // 지오코딩으로 프론트엔드에서 처리
        category: "기타", // 백엔드에서 제공하지 않음
        paymentMethod: "알 수 없음", // 백엔드에서 제공하지 않음
      })
    ) || [];

  // API 데이터에서 VIP 매장 데이터 변환 (지출 금액 계산 포함)
  const vipStores: VIPStore[] = (() => {
    if (!reportData?.spendingDetails.topSpendingMerchants.length) {
      return [];
    }

    // 모든 거래 내역에서 매장별 지출 금액 계산
    const merchantAmounts: Record<string, number> = {};

    reportData.spendingDetails.spendingPerDay.forEach((day) => {
      day.transactions.forEach((transaction) => {
        // TODO: 임시 하드코딩 - 송금 내역 제외 (나중에 제거 예정)
        if (
          transaction.merchant.includes("송금") ||
          transaction.merchant.includes("이체") ||
          transaction.merchant.includes("계좌이체") ||
          transaction.merchant.includes("ATM") ||
          transaction.merchant.includes("입금")
        ) {
          return; // 송금 관련 거래는 제외
        }

        const merchant = transaction.merchant;
        if (!merchantAmounts[merchant]) {
          merchantAmounts[merchant] = 0;
        }
        merchantAmounts[merchant] += transaction.amount;
      });
    });

    return reportData.spendingDetails.topSpendingMerchants
      .filter((merchant) => {
        // TODO: 임시 하드코딩 - 송금 관련 매장 제외 (나중에 제거 예정)
        return (
          !merchant.merchant.includes("송금") &&
          !merchant.merchant.includes("이체") &&
          !merchant.merchant.includes("계좌이체") &&
          !merchant.merchant.includes("ATM") &&
          !merchant.merchant.includes("입금")
        );
      })
      .map((merchant, index) => ({
        id: index.toString(),
        name: merchant.merchant,
        visitCount: merchant.transactionsCount,
        totalAmount: merchantAmounts[merchant.merchant] || 0,
      }));
  })();

  // 총 이상탐지 금액 계산
  const totalAnomalyAmount =
    reportData?.summaryReport.abnormalSpending.totalAbnormalSpending || 0;

  // 퍼센트 계산된 데이터 생성
  const expenseDataWithPercentage = expenseData.map((item) => ({
    ...item,
    percentage: totalAmount > 0 ? (item.value / totalAmount) * 100 : 0,
  }));

  // 카테고리 클릭 핸들러
  const handleCategoryPress = useCallback((category: string) => {
    Alert.alert(
      "카테고리 상세",
      `${category} 카테고리 상세 정보를 보여줍니다.`
    );
    // 실제로는 상세 화면으로 이동
    // router.push(`/report/category-detail?category=${category}`);
  }, []);

  // 더보기 버튼 핸들러
  const handleMoreDetailsPress = useCallback(() => {
    Alert.alert("더보기", "전체 결제 내역을 보여줍니다.");
    // 실제로는 전체 결제 내역 화면으로 이동
    // router.push("/report/payment-details");
  }, []);

  // API 데이터에서 일별 결제 데이터 변환
  const dailyPaymentData: DailyPaymentData[] =
    reportData?.spendingDetails.spendingPerDay.map((dayData) => ({
      date: dayData.date.replace("월 ", ".").replace("일", ""), // "9월 2일" -> "9.2"
      count: dayData.transactions.length,
    })) || [];

  // API 데이터에서 가장 많은 결제 건수를 가진 날들만 변환
  const allDaysPaymentDetails = (() => {
    if (!reportData?.spendingDetails.spendingPerDay.length) {
      return [];
    }

    const daysWithTransactions =
      reportData.spendingDetails.spendingPerDay.filter(
        (day) => day.transactions.length > 0
      ); // 결제 내역이 있는 날만

    if (daysWithTransactions.length === 0) {
      return [];
    }

    // 가장 많은 결제 건수 찾기
    const maxTransactionCount = Math.max(
      ...daysWithTransactions.map((day) => day.transactions.length)
    );

    // 가장 많은 결제 건수를 가진 날들만 필터링
    const maxDays = daysWithTransactions.filter(
      (day) => day.transactions.length === maxTransactionCount
    );

    return maxDays.map((day) => ({
      date: day.date,
      details: day.transactions.map((transaction, index) => ({
        id: `${day.date}-${index}`,
        store: transaction.merchant,
        category: transaction.category,
        paymentMethod: transaction.paymentMethod,
        amount: transaction.amount,
      })),
    }));
  })();

  // VIP 매장 클릭 핸들러
  const handleVIPStorePress = useCallback((storeName: string) => {
    // 모달 제거 - 아무 동작하지 않음
  }, []);

  // 알림 아이콘 클릭 핸들러
  const handleNotificationPress = useCallback(() => {
    router.push("/notification");
  }, [router]);

  // 읽지 않은 알림 개수 계산
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // 알림 개수 업데이트 함수 (http 인터셉터에서 401 처리)
  const updateNotificationCount = useCallback(async () => {
    try {
      // 토큰 존재 여부 확인
      const hasToken = await validateToken();
      if (!hasToken) {
        return;
      }

      const notificationData = await fetchNotifications();
      const unreadCount = notificationData.items.filter(
        (notification) => notification.readAt === null
      ).length;
      setUnreadNotificationCount(unreadCount);
    } catch (error: any) {
      // 401 에러는 http 인터셉터에서 처리됨
    }
  }, [validateToken]);

  // 페이지 포커스될 때마다 알림 개수 업데이트 및 리포트 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      updateNotificationCount();
      if (profile?.userId) {
        fetchReportData();
      }
    }, [updateNotificationCount, fetchReportData, profile?.userId])
  );

  // 인증 로딩 중이거나 인증되지 않은 경우
  if (authLoading || !isAuthenticated || isTokenValid === false) {
    return null;
  }

  // 프로필 로딩 중이거나 리포트 로딩 중인 경우
  if (profileLoading || isLoading) {
    return (
      <LoadingOverlay visible={true} message="리포트 데이터를 불러오는 중..." />
    );
  }

  // 에러가 발생한 경우
  if (error) {
    Alert.alert("오류", error, [
      {
        text: "다시 시도",
        onPress: () => {
          setError(null);
          setRetryCount(0);
          fetchReportData();
        },
      },
      { text: "확인", style: "cancel" },
    ]);
    return (
      <LoadingOverlay visible={true} message="오류 발생, 다시 시도 중..." />
    );
  }


  // 리포트 데이터가 없는 경우 (이전 달 데이터가 없을 때)
  if (!reportData || 
      !reportData.summaryReport.spendingByCategory.length || 
      reportData.summaryReport.monthlySpendingSummary.totalSpending === 0) {
    return <NoReportScreen />;
  }

  return (
    <ExpenseReportTemplate
      year={currentYear}
      month={currentMonth}
      totalAmount={totalAmount}
      fixedExpenseAmount={fixedExpenseAmount}
      variableExpenseAmount={variableExpenseAmount}
      chartData={expenseDataWithPercentage}
      categoryData={expenseDataWithPercentage}
      onCategoryPress={handleCategoryPress}
      dailyPaymentData={dailyPaymentData}
      allDaysPaymentDetails={allDaysPaymentDetails}
      vipStores={vipStores}
      onVIPStorePress={handleVIPStorePress}
      anomalyData={anomalyData}
      totalAnomalyAmount={totalAnomalyAmount}
      overallSummary={reportData?.summaryReport.overallSummary}
      onNotificationPress={handleNotificationPress}
      unreadNotificationCount={unreadNotificationCount}
    />
  );
}
