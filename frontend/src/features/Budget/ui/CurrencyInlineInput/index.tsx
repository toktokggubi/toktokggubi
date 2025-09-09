import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { useRef } from "react";
import { CurrencyInlineInputProps } from "./types";
import { krw, onlyNum } from "~features/Budget/utils/currency";

export default function CurrencyInlineInput({
  value,
  onChange,
  placeholder = "0",
}: CurrencyInlineInputProps) {
  const ref = useRef<TextInput>(null);

  return (
    <View style={{ alignItems: "center" }}>
      <Pressable onPress={() => ref.current?.focus()}>
        <Text style={s.amount}>{krw(value)}</Text>
      </Pressable>
      <TextInput
        ref={ref}
        value={value ? String(value) : ""}
        onChangeText={(t) => onChange(onlyNum(t))}
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
  amount: { fontSize: 36, fontWeight: "900", color: "#111" },
  hidden: { height: 0, opacity: 0 }, // 화면에는 안 보이지만 포커스/키패드용
  hint: { marginTop: 6, color: "#9CA3AF", fontSize: 12 },
});
