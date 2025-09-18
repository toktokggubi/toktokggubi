// src/features/Lucky/ui/PrimaryButton/index.tsx
import React from "react";
import { Pressable, Text, type PressableProps } from "react-native";
import { s } from "./variants";

interface Props {
  text: string;
  onPress: NonNullable<PressableProps["onPress"]>;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export function PrimaryButton({
  text,
  onPress,
  disabled,
  accessibilityLabel,
}: Props) {
  return (
    <Pressable
      style={[s.btn, disabled && { opacity: 0.5 }]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? text} // ✅ 접근성 라벨 지원
    >
      <Text style={s.btnTxt}>{text}</Text>
    </Pressable>
  );
}
