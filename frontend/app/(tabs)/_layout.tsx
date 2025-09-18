import { Tabs, router } from "expo-router";
import React, { useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
// import FontAwesome6 from "@expo/vector-icons/FontAwesome6"; 소비 탭
import Ionicons from "@expo/vector-icons/Ionicons";

import { useShakeAdvanced } from "@/shared/hooks/useShake";
import SvgTabBar from "@/shared/ui/SvgTabBar";
import HomeScreen from "./home/index";
import LuckyScreen from "./lucky/index";
import MyPageScreen from "./mypage/index";

const Tab = createBottomTabNavigator();

const tabs = [
  { name: "home/index", icon: "home", label: "홈" },
  { name: "lucky/index", icon: "staro", label: "혜택" },
  { name: "mypage", icon: "person-circle", label: "마이페이지" },
];

export default function TabLayout() {
  const isFocused = useIsFocused();

  // 컴포넌트가 마운트될 때 흔들기 훅 초기화
  useEffect(() => {
  }, [isFocused]);

  // 탭 화면에서만 흔들기 활성화
  useShakeAdvanced(
    () => {
      router.push({
        pathname: "/pay/payment",
        params: { source: "shake" },
      });
    },
    { enabled: isFocused }
  );

  return (
    <Tab.Navigator
      tabBar={(props) => <SvgTabBar {...props} tabs={tabs} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="home/index" component={HomeScreen} />
      <Tab.Screen name="lucky/index" component={LuckyScreen} />
      <Tab.Screen name="mypage" component={MyPageScreen} />
    </Tab.Navigator>
  );
}
