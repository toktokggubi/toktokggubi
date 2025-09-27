// src/shared/ui/NotificationAlert/index.tsx
import React from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";
import { s } from "./variants";
import type { NotificationAlertProps } from "./types";

export default function NotificationAlert({
  visible,
  title,
  message,
  confirmText = "확인",
  onConfirm,
}: NotificationAlertProps) {
  const handleConfirm = () => {
    onConfirm?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={s.overlay}>
        <View style={s.container}>
          {/* 캐릭터 이미지 */}
          <Image
            source={require("@/assets/images/character/notification.png")}
            style={s.characterImage}
            resizeMode="contain"
          />

          {/* 제목 */}
          {title && <Text style={s.title}>{title}</Text>}

          {/* 메시지 */}
          <Text style={s.message}>{message}</Text>

          {/* 확인 버튼 */}
          <View style={s.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                s.confirmButton,
                pressed && s.buttonPressed,
              ]}
              onPress={handleConfirm}
            >
              <Text style={s.confirmButtonText}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
