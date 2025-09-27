// src/shared/ui/LoadingOverlay/LoadingOverlay.tsx
import React from "react";
import { Modal, View, Text } from "react-native";
import { Image } from "expo-image";
import { s } from "./variants";

const DanceGif = require("@/assets/images/illustration/dance.gif");

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
          <Image source={DanceGif} style={s.gifIcon} contentFit="contain" />

          {/* 로딩 메시지 */}
          <Text style={s.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}
