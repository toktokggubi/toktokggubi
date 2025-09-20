import { Pressable, Text } from "react-native";
import { PrevButtonProps } from "./types";
import { makePrevButtonStyles } from "./variants";

export default function PrevButton({
  label = "이전",
  onPress,
  disabled,
  tone = "link",
}: PrevButtonProps) {
  const s = makePrevButtonStyles(tone);
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
