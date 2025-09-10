import React from "react";
import { SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import WelcomeTemplate from "@/features/Auth/templates/WelcomeTemplate";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleStart = () => {
    router.push("/home");
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
