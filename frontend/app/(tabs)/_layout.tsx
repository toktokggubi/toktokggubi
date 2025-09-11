import { Tabs, router } from "expo-router";
import React, { useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";

import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
// import FontAwesome6 from "@expo/vector-icons/FontAwesome6"; 소비 탭
import Ionicons from "@expo/vector-icons/Ionicons";

import { useShakeAdvanced } from "@/shared/hooks/useShake";

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
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // 라벨 감추고 아이콘만
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "gray",
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="home/index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />

      {/* Lucky (혜택) */}
      <Tabs.Screen
        name="lucky/index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="staro" size={size} color={color} />
          ),
        }}
      />

      {/* 마이페이지 */}
      <Tabs.Screen
        name="mypage"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
