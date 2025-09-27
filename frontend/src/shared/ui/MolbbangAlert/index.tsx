// src/shared/ui/MolbbangAlert/index.tsx
import React from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import { s } from "./variants";
import LottieView from "lottie-react-native";

const CheckLottie = require("@/assets/icon/Joyful Check.json");

interface MolbbangAlertProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  type?: "default" | "success" | "error" | "warning";
}

export default function MolbbangAlert({
  visible,
  title,
  message,
  confirmText = "확인",
  cancelText,
  onConfirm,
  onCancel,
  type = "default",
}: MolbbangAlertProps) {
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          icon: "lottie", // Lottie 애니메이션 사용을 위한 식별자
          confirmBg: colors.BLUE_LIGHT,
          confirmBorder: colors.BLUE_LIGHT_ACTIVE,
          confirmText: colors.BLUE_DARKER,
        };
      case "error":
        return {
          icon: "❌",
          confirmBg: colors.GRAY_LIGHT,
          confirmBorder: colors.GRAY_LIGHT_ACTIVE,
          confirmText: colors.GRAY_DARKER,
        };
      case "warning":
        return {
          icon: "⚠️",
          confirmBg: colors.YELLOW_LIGHT,
          confirmBorder: colors.YELLOW_LIGHT_ACTIVE,
          confirmText: colors.BLUE_DARKER,
        };
      default:
        return {
          icon: "ℹ️",
          confirmBg: colors.BLUE_LIGHT,
          confirmBorder: colors.BLUE_LIGHT_ACTIVE,
          confirmText: colors.BLUE_DARKER,
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={s.overlay}>
        <View style={s.container}>
          {/* 아이콘 */}
          {typeStyles.icon === "lottie" ? (
            <LottieView
              source={CheckLottie}
              style={s.lottieIcon}
              autoPlay
              loop={false}
              speed={1.5}
            />
          ) : (
            <Text style={s.icon}>{typeStyles.icon}</Text>
          )}

          {/* 제목 */}
          {title && <Text style={s.title}>{title}</Text>}

          {/* 메시지 */}
          <Text style={s.message}>{message}</Text>

          {/* 버튼 영역 */}
          <View style={s.buttonContainer}>
            {cancelText && (
              <Pressable
                style={({ pressed }) => [
                  s.cancelButton,
                  pressed && s.buttonPressed,
                ]}
                onPress={onCancel}
              >
                <Text style={s.cancelButtonText}>{cancelText}</Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [
                s.confirmButton,
                {
                  backgroundColor: typeStyles.confirmBg,
                  borderColor: typeStyles.confirmBorder,
                },
                pressed && s.buttonPressed,
              ]}
              onPress={onConfirm}
            >
              <Text
                style={[s.confirmButtonText, { color: typeStyles.confirmText }]}
              >
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
