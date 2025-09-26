// frontend/src/features/Report/screens/ReportScreen.tsx
import { fetchNotifications } from "@/features/Notification/api/notificationApi";
import { useAuthGuard } from "@/shared/hooks/useAuthGuard";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState, useEffect } from "react";
import { Alert, ActivityIndicator, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import { ExpenseReportTemplate } from "../templates/ExpenseReportTemplate";
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

// 샘플 데이터 (실제로는 API에서 가져올 데이터)
const sampleData: DonutChartData[] = [
  {
    label: "식비",
    value: 350000,
    color: "#3B82F6", // 파란색
    percentage: 67.8,
  },
  {
    label: "쇼핑",
    value: 130000,
    color: "#F59E0B", // 노란색
    percentage: 25.2,
  },
  {
    label: "교통",
    value: 82000,
    color: "#EF4444", // 빨간색
    percentage: 15.9,
  },
  {
    label: "뷰티",
    value: 35000,
    color: "#10B981", // 초록색
    percentage: 6.8,
  },
  {
    label: "유흥",
    value: 12000,
    color: "#F97316", // 주황색
    percentage: 2.3,
  },
  {
    label: "기타",
    value: 12000,
    color: "#6B7280", // 회색
    percentage: 2.3,
  },
];

// 일별 결제 데이터 샘플 (1일부터 30일까지)
const generateDailyPaymentData = (): DailyPaymentData[] => {
  const data: DailyPaymentData[] = [];
  for (let day = 1; day <= 30; day++) {
    // 랜덤한 결제 건수 생성 (0-5 사이)
    const count = Math.floor(Math.random() * 9);
    data.push({
      date: `9.${day}`,
      count: count,
    });
  }
  return data;
};

const sampleDailyPaymentData = generateDailyPaymentData();

// 최대 결제일 상세 내역 샘플
const sampleMaxPaymentDayDetails: PaymentDetail[] = [
  {
    id: "1",
    store: "다이소",
    category: "생활",
    paymentMethod: "네이버페이 카드",
    amount: 2000,
  },
  {
    id: "2",
    store: "스타벅스",
    category: "카페/디저트",
    paymentMethod: "삼성 카드",
    amount: 5600,
  },
];

// VIP 매장 샘플 데이터
const sampleVIPStores: VIPStore[] = [
  {
    id: "1",
    name: "스타벅스",
    visitCount: 7,
    totalAmount: 45000,
  },
  {
    id: "2",
    name: "충남대 레드버튼",
    visitCount: 5,
    totalAmount: 25000,
  },
  {
    id: "3",
    name: "덕디야",
    visitCount: 4,
    totalAmount: 18000,
  },
  {
    id: "4",
    name: "도미노피자",
    visitCount: 2,
    totalAmount: 32000,
  },
  {
    id: "5",
    name: "할리스",
    visitCount: 2,
    totalAmount: 12000,
  },
];

// 이상탐지 샘플 데이터 (다양한 매장)
const sampleAnomalyData: AnomalyData[] = [
  {
    id: "1",
    storeName: "이디야커피 대전구암동점",
    amount: 12000,
    date: "09.20",
    latitude: 36.361109, // 이디야커피 대전구암동점
    longitude: 127.307039,
    category: "카페/디저트",
    paymentMethod: "삼성 카드",
  },
  {
    id: "2",
    storeName: "옛날숯불갈비본점",
    amount: 35000,
    date: "09.17",
    latitude: 36.358542, // 옛날숯불갈비본점
    longitude: 127.308368,
    category: "식비",
    paymentMethod: "네이버페이 카드",
  },
  {
    id: "3",
    storeName: "크래버 대게나라 대전유성점",
    amount: 7000,
    date: "09.11",
    latitude: 36.358392, // 크래버 대게나라 대전유성점
    longitude: 127.343857,
    category: "식비",
    paymentMethod: "삼성 카드",
  },
  {
    id: "4",
    storeName: "뼈먹자",
    amount: 25000,
    date: "09.08",
    latitude: 36.357115, // 뼈먹자
    longitude: 127.34616,
    category: "식비",
    paymentMethod: "네이버페이 카드",
  },
];

export default function ReportScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard();
  const { data: profile, isLoading: profileLoading } = useProfileQuery();

  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(8); // 9월 - 1 = 8월
  const [expenseData, setExpenseData] = useState<DonutChartData[]>(sampleData);
  const [reportData, setReportData] = useState<UserReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  // 토큰 존재 여부 확인 (간단한 검증)
  const validateToken = useCallback(async () => {
    try {
      const accessToken = await SecureStore.getItemAsync("access_token");
      const refreshToken = await SecureStore.getItemAsync("refresh_token");
      
      console.log("토큰 확인:", {
        accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : null,
        refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : null
      });
      
      if (!accessToken || !refreshToken) {
        console.log("토큰이 없습니다.");
        setIsTokenValid(false);
        return false;
      }
      
      setIsTokenValid(true);
      return true;
    } catch (error) {
      console.error("토큰 확인 실패:", error);
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
      console.log("토큰이 없습니다. 로그인 페이지로 이동합니다.");
      router.replace("/auth/login");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchCurrentUserReport(currentYear, currentMonth);
      setReportData(data);
      setRetryCount(0); // 성공 시 재시도 카운트 리셋
      
      // API 데이터를 차트 데이터로 변환
      const chartData: DonutChartData[] = data.summaryReport.spendingByCategory.map((item, index) => {
        const colors = ["#3B82F6", "#F59E0B", "#EF4444", "#10B981", "#F97316", "#6B7280"];
        return {
          label: item.category,
          value: item.amount,
          color: colors[index % colors.length],
          percentage: item.percentage,
        };
      });
      setExpenseData(chartData);
    } catch (err: any) {
      console.error("리포트 데이터 조회 실패:", err);
      
      // 토큰 갱신 실패로 인한 에러인 경우 로그인 페이지로 이동
      if (err?.message === "NO_REFRESH_TOKEN" || err?.message === "NO_ACCESS_FROM_REFRESH") {
        console.log("토큰 갱신 실패 - 로그인 페이지로 이동");
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
        router.replace("/auth/login");
        return;
      }
      
      setError(err?.response?.data?.message || "리포트 데이터를 불러오는데 실패했습니다.");
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
  const totalAmount = reportData?.summaryReport.monthlySpendingSummary.totalSpending || 
    expenseData.reduce((sum, item) => sum + item.value, 0);

  // API 데이터에서 이상탐지 데이터 변환
  const anomalyData: AnomalyData[] = reportData?.summaryReport.abnormalSpending.transactions.map((transaction, index) => ({
    id: index.toString(),
    storeName: transaction.location || "알 수 없는 매장",
    amount: transaction.amount,
    date: transaction.date,
    latitude: 0, // 백엔드에서 제공하지 않음
    longitude: 0, // 백엔드에서 제공하지 않음
    category: "기타", // 백엔드에서 제공하지 않음
    paymentMethod: "알 수 없음", // 백엔드에서 제공하지 않음
  })) || sampleAnomalyData;

  // API 데이터에서 VIP 매장 데이터 변환
  const vipStores: VIPStore[] = reportData?.spendingDetails.topSpendingMerchants.map((merchant, index) => ({
    id: index.toString(),
    name: merchant.merchant,
    visitCount: merchant.transactionsCount,
    totalAmount: 0, // 백엔드에서 총 금액 정보를 제공하지 않음
  })) || sampleVIPStores;

  // 총 이상탐지 금액 계산
  const totalAnomalyAmount = reportData?.summaryReport.abnormalSpending.totalAbnormalSpending || 
    sampleAnomalyData.reduce((sum, item) => sum + item.amount, 0);

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
  const dailyPaymentData: DailyPaymentData[] = reportData?.spendingDetails.spendingPerDay.map((dayData) => ({
    date: dayData.date.replace("월 ", ".").replace("일", ""), // "9월 2일" -> "9.2"
    count: dayData.transactions.length,
  })) || sampleDailyPaymentData;

  // API 데이터에서 최대 결제일 상세 내역 변환
  const maxPaymentDayDetails: PaymentDetail[] = (() => {
    if (!reportData?.spendingDetails.spendingPerDay.length) return sampleMaxPaymentDayDetails;
    
    const maxDay = reportData.spendingDetails.spendingPerDay.reduce((max, day) => 
      day.transactions.length > max.transactions.length ? day : max
    );
    
    return maxDay.transactions.map((transaction, index) => ({
      id: index.toString(),
      store: transaction.merchant,
      category: transaction.category,
      paymentMethod: transaction.paymentMethod,
      amount: transaction.amount,
    }));
  })();

  // 최대 결제일 계산
  const maxPaymentDay = (() => {
    if (!reportData?.spendingDetails.spendingPerDay.length) return "9월 25일";
    
    const maxDay = reportData.spendingDetails.spendingPerDay.reduce((max, day) => 
      day.transactions.length > max.transactions.length ? day : max
    );
    
    return maxDay.date; // 이미 "9월 2일" 형식으로 되어 있음
  })();

  // VIP 매장 클릭 핸들러
  const handleVIPStorePress = useCallback((storeName: string) => {
    Alert.alert("VIP 매장 상세", `${storeName} 매장 상세 정보를 보여줍니다.`);
    // 실제로는 매장 상세 화면으로 이동
    // router.push(`/report/store-detail?store=${storeName}`);
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
        console.log("알림 조회: 토큰이 없습니다.");
        return;
      }
      
      const notificationData = await fetchNotifications();
      const unreadCount = notificationData.items.filter(
        (notification) => notification.readAt === null
      ).length;
      setUnreadNotificationCount(unreadCount);
    } catch (error: any) {
      console.error("알림 개수 조회 실패:", error);
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
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
        }
      },
      { text: "확인", style: "cancel" }
    ]);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ExpenseReportTemplate
      year={currentYear}
      month={currentMonth}
      totalAmount={totalAmount}
      chartData={expenseDataWithPercentage}
      categoryData={expenseDataWithPercentage}
      onCategoryPress={handleCategoryPress}
      dailyPaymentData={dailyPaymentData}
      maxPaymentDay={maxPaymentDay}
      maxPaymentDayDetails={maxPaymentDayDetails}
      onMoreDetailsPress={handleMoreDetailsPress}
      vipStores={vipStores}
      onVIPStorePress={handleVIPStorePress}
      anomalyData={anomalyData}
      totalAnomalyAmount={totalAnomalyAmount}
      onNotificationPress={handleNotificationPress}
      unreadNotificationCount={unreadNotificationCount}
    />
  );
}
