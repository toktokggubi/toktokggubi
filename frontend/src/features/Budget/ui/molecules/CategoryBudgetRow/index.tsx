import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import { krw, onlyNum } from "@/shared/utils/currency";
import React, { useMemo, useRef, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { CategoryBudgetRowProps } from "./types";

export default function CategoryBudgetRow({
  name,
  label,
  icon,
  amount,
  onChangeAmount,
  disabled,
  testID,
}: CategoryBudgetRowProps) {
  const inputRef = useRef<TextInput>(null);

  // 화면 표시용 문자열
  const [display, setDisplay] = useState(krw(amount));

  // 외부 amount 동기화
  React.useEffect(() => {
    setDisplay(krw(amount));
  }, [amount]);

  const canEdit = !!onChangeAmount && !disabled;

  const handlePressRow = () => {
    if (canEdit) inputRef.current?.focus();
  };

  const handleChangeText = (text: string) => {
    const n = onlyNum(text);
    setDisplay(krw(n));
    onChangeAmount?.(n);
  };

  const a11yLabel = useMemo(
    () => `${label ?? name} 예산 ${display}`,
    [label, name, display]
  );

  return (
    <Pressable
      onPress={handlePressRow}
      disabled={!canEdit}
      style={({ pressed }) => [
        styles.container,
        pressed && canEdit && styles.containerPressed,
        disabled && styles.containerDisabled,
      ]}
      accessibilityLabel={a11yLabel}
      testID={testID}
    >
      <View style={styles.left}>
        <Image source={icon} style={styles.icon} resizeMode="contain" />
        <Text style={styles.label}>{label ?? name}</Text>
      </View>

      <View style={styles.right}>
        <TextInput
          ref={inputRef}
          value={display.replace(" 원", "")} // 입력 시 "원" 제외
          onChangeText={handleChangeText}
          editable={canEdit}
          keyboardType="number-pad"
          returnKeyType="done"
          selectTextOnFocus
          style={[styles.amount, !canEdit && styles.amountDisabled]}
          inputMode="numeric"
        />
        <Text style={[styles.won, !canEdit && styles.amountDisabled]}>원</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.BLUE_LIGHT,
    backgroundColor: "#fff",
  },
  containerPressed: { opacity: 0.9 },
  containerDisabled: { opacity: 1 },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  icon: { width: 36, height: 36 },
  label: {
    fontSize: 16,
    ...font.medium,
    color: colors.GRAY_DARK,
  },
  right: { flexDirection: "row", alignItems: "center" },
  amount: {
    minWidth: 90,
    textAlign: "right",
    fontSize: 16,
    ...font.bold,
    color: colors.GRAY_DARK,
    padding: 0,
    margin: 0,
  },
  amountDisabled: { color: colors.GRAY_DARK },
  won: {
    marginLeft: 4,
    fontSize: 14,
    ...font.medium,
    color: colors.GRAY_DARK,
  },
});
