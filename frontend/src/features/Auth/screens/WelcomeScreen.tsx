import React from "react";
import { SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import WelcomeTemplate from "@/features/Auth/templates/WelcomeTemplate";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleStart = () => {
    // 전체 앱을 리셋하여 깨끗한 상태로 메인 화면으로 이동
    router.dismissAll();
    router.replace("/home");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WelcomeTemplate
        centerImageSource={require("@/assets/images/character/big-character-01.png")}
        onStart={handleStart}
      />
    </SafeAreaView>
  );
}
