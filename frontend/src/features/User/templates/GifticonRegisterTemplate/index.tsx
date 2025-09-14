import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "@/shared/constants/colors";
import type { GifticonRegisterTemplateProps } from "./types";
import { GifticonImageUpload } from "@/features/User/ui/GifticonImageUpload";
import { GifticonForm } from "@/features/User/ui/GifticonForm";

export default function GifticonRegisterTemplate(
  props: GifticonRegisterTemplateProps
) {
  const {
    imageUri,
    onPickImage,
    loadingPreview,
    merchant,
    onMerchantChange,
    label,
    onLabelChange,
    expiresAt,
    onExpiresAtChange,
    onSubmit,
    saving,
  } = props;

  return (
    <View style={s.wrap}>
      <GifticonImageUpload
        value={imageUri}
        onChange={onPickImage}
        loading={loadingPreview}
      />
      <GifticonForm
        merchant={merchant}
        onMerchantChange={onMerchantChange}
        label={label}
        onLabelChange={onLabelChange}
        expiresAt={expiresAt}
        onExpiresAtChange={onExpiresAtChange}
        onSubmit={onSubmit}
        disabled={saving}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.BACKGROUND_PRIMARY, padding: 16 },
});
