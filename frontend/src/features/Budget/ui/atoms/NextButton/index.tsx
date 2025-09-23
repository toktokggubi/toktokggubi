import { Pressable, Text } from "react-native";
import { NextButtonProps } from "./types";
import { makeNextButtonStyles } from "./variants";

export default function NextButton({
  label = "다음",
  onPress,
  disabled,
  tone = "link",
}: NextButtonProps) {
  const s = makeNextButtonStyles(tone);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.btn,
        pressed && s.pressed,
        disabled && s.disabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${label} 버튼`}
    >
      <Text style={s.txt}>{label}</Text>
    </Pressable>
  );
}
