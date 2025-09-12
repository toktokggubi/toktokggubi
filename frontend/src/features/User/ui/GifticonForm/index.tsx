import React from "react";
import { View, TextInput, Pressable, Text, StyleSheet } from "react-native";
import { colors } from "@/shared/constants/colors";

interface Props {
  merchant: string;
  onMerchantChange: (t: string) => void;
  label: string;
  onLabelChange: (t: string) => void;
  expiresAt: string;
  onExpiresAtChange: (t: string) => void;
  onSubmit: () => void;
}

export function GifticonForm({
  merchant,
  onMerchantChange,
  label,
  onLabelChange,
  expiresAt,
  onExpiresAtChange,
  onSubmit,
}: Props) {
  return (
    <View style={s.wrap}>
      <TextInput
        style={s.input}
        placeholder="사용처"
        value={merchant}
        onChangeText={onMerchantChange}
      />
      <TextInput
        style={s.input}
        placeholder="종류"
        value={label}
        onChangeText={onLabelChange}
      />
      <TextInput
        style={s.input}
        placeholder="유효기간 (YYYY-MM-DD)"
        value={expiresAt}
        onChangeText={onExpiresAtChange}
      />
      <Pressable style={s.btn} onPress={onSubmit}>
        <Text style={s.btnTxt}>등록하기</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 16 },
  input: {
    borderBottomWidth: 1,
    borderColor: colors.GRAY_LIGHT_ACTIVE,
    paddingVertical: 8,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: colors.BLUE_NORMAL,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  btnTxt: { color: "white", fontWeight: "600" },
});
