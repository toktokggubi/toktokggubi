import React from "react";
import { Pressable, Text, type PressableProps } from "react-native";
import { s } from "./variants";

interface Props {
  text: string;
  onPress: NonNullable<PressableProps["onPress"]>;
  disabled?: boolean;
  variant?: "add" | "reset";
  accessibilityLabel?: string;
}

export function NbbangActionButton({
  text,
  onPress,
  disabled,
  variant = "add",
  accessibilityLabel,
}: Props) {
  const buttonStyle = variant === "add" ? s.addBtn : s.resetBtn;
  const textStyle = variant === "add" ? s.addBtnTxt : s.resetBtnTxt;

  return (
    <Pressable
      style={[buttonStyle, disabled && { opacity: 0.5 }]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? text}
    >
      <Text style={textStyle}>{text}</Text>
    </Pressable>
  );
}
