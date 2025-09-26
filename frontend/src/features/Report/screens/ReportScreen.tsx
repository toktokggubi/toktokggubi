// frontend/src/features/Report/screens/ReportScreen.tsx
import { fetchNotifications } from "@/features/Notification/api/notificationApi";
import { useAuthGuard } from "@/shared/hooks/useAuthGuard";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert } from "react-native";
import { ExpenseReportTemplate } from "../templates/ExpenseReportTemplate";
import type {
  DailyPaymentData,
  PaymentDetail,
  VIPStore,
} from "../templates/ExpenseReportTemplate/types";
import type { AnomalyData } from "../ui/AnomalyMap/types";
import type { DonutChartData } from "../ui/ExpenseDonutChart/types";

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

  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(8); // 9월 - 1 = 8월
  const [expenseData, setExpenseData] = useState<DonutChartData[]>(sampleData);

  // 총 지출 금액 계산
  const totalAmount = expenseData.reduce((sum, item) => sum + item.value, 0);

  // 총 이상탐지 금액 계산
  const totalAnomalyAmount = sampleAnomalyData.reduce(
    (sum, item) => sum + item.amount,
    0
  );

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

  // 최대 결제일 계산
  const maxPaymentDay = "9월 25일";

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

  // 알림 개수 업데이트 함수
  const updateNotificationCount = useCallback(async () => {
    try {
      const notificationData = await fetchNotifications();
      const unreadCount = notificationData.items.filter(
        (notification) => notification.readAt === null
      ).length;
      setUnreadNotificationCount(unreadCount);
    } catch (error) {
      console.error("알림 개수 조회 실패:", error);
    }
  }, []);

  // 페이지 포커스될 때마다 알림 개수 업데이트
  useFocusEffect(
    useCallback(() => {
      updateNotificationCount();
    }, [updateNotificationCount])
  );

  // 인증 로딩 중이거나 인증되지 않은 경우
  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <ExpenseReportTemplate
      year={currentYear}
      month={currentMonth}
      totalAmount={totalAmount}
      summaryText="예산의 89%, 월소득의 23%를 사용하셨어요"
      chartData={expenseDataWithPercentage}
      categoryData={expenseDataWithPercentage}
      onCategoryPress={handleCategoryPress}
      dailyPaymentData={sampleDailyPaymentData}
      maxPaymentDay={maxPaymentDay}
      maxPaymentDayDetails={sampleMaxPaymentDayDetails}
      onMoreDetailsPress={handleMoreDetailsPress}
      vipStores={sampleVIPStores}
      onVIPStorePress={handleVIPStorePress}
      anomalyData={sampleAnomalyData}
      totalAnomalyAmount={totalAnomalyAmount}
      onNotificationPress={handleNotificationPress}
      unreadNotificationCount={unreadNotificationCount}
    />
  );
}
