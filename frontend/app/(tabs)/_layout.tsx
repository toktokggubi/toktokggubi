import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useIsFocused } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect } from "react";

// import FontAwesome6 from "@expo/vector-icons/FontAwesome6"; 소비 탭

import { useShakeAdvanced } from "@/shared/hooks/useShake";
import NotificationSettingsService from "@/shared/services/notificationSettingsService";
import SvgTabBar from "@/shared/ui/SvgTabBar";
import PaymentScreen from "../pay/payment";
import HomeScreen from "./home/index";
import LuckyScreen from "./lucky/index";
import MyPageScreen from "./mypage/index";
import ReportScreen from "@/features/Report/screens/ReportScreen";

const Tab = createBottomTabNavigator();

const tabs = [
  { name: "home/index", icon: "home", label: "홈" },
  { name: "report", icon: "ai-report", label: "리포트" },
  { name: "payment", icon: "payment-barcode", label: "결제" },
  { name: "lucky/index", icon: "staro", label: "혜택" },
  { name: "mypage", icon: "person-circle", label: "마이페이지" },
];

export default function TabLayout() {
  const isFocused = useIsFocused();
  const notificationService = NotificationSettingsService.getInstance();

  // 컴포넌트가 마운트될 때 흔들기 훅 초기화
  useEffect(() => {}, [isFocused]);

  // 쉐이크 핸들러 - 알림 설정 확인 후 실행
  const handleShake = async () => {
    try {
      // 쉐이크 트리거 알림이 활성화되어 있는지 확인
      const isShakeEnabled = await notificationService.isNotificationEnabled('shakeTriggerOn');
      
      if (!isShakeEnabled) {
        return;
      }

      // 진동 효과 추가 - 더 강렬한 지지징~ 진동
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 30);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 60);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 90);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 120);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 150);

      router.push({
        pathname: "/pay/payment",
        params: { source: "shake" },
      });
    } catch (error) {
    }
  };

  // 탭 화면에서만 흔들기 활성화
  useShakeAdvanced(
    handleShake,
    { 
      enabled: isFocused,
      thresholdG: 0.8, // 임계값을 낮춰서 더 민감하게 (기본값: 1.4)
      minShakes: 3, // 연속 흔들기 횟수를 줄여서 더 민감하게 (기본값: 5)
      sampleMs: 30, // 샘플링 주기를 짧게 해서 더 반응 빠르게 (기본값: 50)
      windowMs: 300, // 연속 판정 시간창을 짧게 (기본값: 450)
    }
  );

  return (
    <Tab.Navigator
      tabBar={(props) => <SvgTabBar {...props} tabs={tabs} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tab.Screen name="home/index" component={HomeScreen} />
      <Tab.Screen name="report" component={ReportScreen} />
      <Tab.Screen name="payment" component={PaymentScreen} />
      <Tab.Screen name="lucky/index" component={LuckyScreen} />
      <Tab.Screen name="mypage" component={MyPageScreen} />
    </Tab.Navigator>
  );
}
