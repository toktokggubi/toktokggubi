import React from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import type { GifticonRegisterTemplateProps } from "./types";
import { GifticonImageUpload } from "@/features/User/ui/GifticonImageUpload";

export default function GifticonRegisterTemplate(
  props: GifticonRegisterTemplateProps
) {
  const { imageUri, onPickImage, loading, onSubmit } = props;

  return (
    <View style={s.wrap}>
      <GifticonImageUpload
        value={imageUri}
        onChange={onPickImage}
        loading={false}
      />
      <Pressable
        style={[s.button, !imageUri && s.buttonDisabled]}
        onPress={onSubmit}
        disabled={!imageUri || loading}
      >
        <Text style={[s.buttonText, !imageUri && s.buttonTextDisabled]}>
          {loading ? "OCR 처리 중..." : "등록하기"}
        </Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.BACKGROUND_PRIMARY, padding: 16 },
  button: {
    backgroundColor: colors.BLUE_NORMAL,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: colors.GRAY_LIGHT,
  },
  buttonText: {
    color: "#FFFFFF",
    ...font.bold,
    fontSize: 16,
  },
  buttonTextDisabled: {
    color: colors.GRAY_DARK,
  },
});
