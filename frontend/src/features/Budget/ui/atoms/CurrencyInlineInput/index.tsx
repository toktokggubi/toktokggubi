import { font } from "@/shared/typography/font";
import { krw } from "@/shared/utils/currency";
import { useRef } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { CurrencyInlineInputProps } from "./types";

export default function CurrencyInlineInput({
  value,
  onChange,
  onFocus,
  placeholder = "0",
}: CurrencyInlineInputProps) {
  const ref = useRef<TextInput>(null);

  const handleFocus = () => {
    onFocus?.();
    ref.current?.focus();
  };

  return (
    <View style={{ alignItems: "center" }}>
      <Pressable onPress={handleFocus}>
        <Text style={s.amount}>
          {typeof value === "string" ? krw(parseInt(value) || 0) : krw(value)}
        </Text>
      </Pressable>
      <TextInput
        ref={ref}
        value={typeof value === "string" ? value : value ? String(value) : ""}
        onChangeText={onChange}
        onFocus={onFocus}
        keyboardType="number-pad" // ← 기본 키패드
        inputMode="numeric"
        placeholder={placeholder}
        style={s.hidden}
      />
      <Text style={s.hint}>숫자를 탭하면 키패드가 열려요</Text>
    </View>
  );
}
const s = StyleSheet.create({
  amount: { fontSize: 48, ...font.bold, color: "#111" }, // 사진과 동일한 크기
  hidden: { height: 0, opacity: 0 }, // 화면에는 안 보이지만 포커스/키패드용
  hint: { marginTop: 6, color: "#9CA3AF", fontSize: 12 },
});
