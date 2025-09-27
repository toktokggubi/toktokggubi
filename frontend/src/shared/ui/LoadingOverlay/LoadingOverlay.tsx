// src/shared/ui/LoadingOverlay/LoadingOverlay.tsx
import React from "react";
import { Modal, View, Text } from "react-native";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import { s } from "./variants";
import LottieView from "lottie-react-native";

const LoadingLottie = require("@/assets/icon/loading.json");

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
}

export default function LoadingOverlay({
  visible,
  message = "로딩 중...",
  transparent = false,
}: LoadingOverlayProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={[s.overlay, transparent && s.overlayTransparent]}>
        <View style={s.container}>
          {/* 로딩 애니메이션 */}
          <LottieView
            source={LoadingLottie}
            style={s.lottieIcon}
            autoPlay
            loop
            speed={1}
          />

          {/* 로딩 메시지 */}
          <Text style={s.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}
