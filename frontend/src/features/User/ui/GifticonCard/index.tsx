// src/features/User/ui/GifticonCard/index.tsx
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import { Image } from "expo-image";
import React, { memo } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type TextStyle,
} from "react-native";
import type { GifticonCardProps } from "./types";

const androidTight: TextStyle = Platform.select({
  android: { includeFontPadding: false }, // ✅ 스타일로 적용
  default: {},
})!;

function GifticonCardImpl({
  imageSource,
  title,
  brand,
  onPress,
}: GifticonCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={s.card}
      android_ripple={{ borderless: false }}
    >
      <View style={s.thumbWrap}>
        <Image
          source={imageSource}
          style={s.thumb}
          contentFit="cover"
          contentPosition="top center"
        />
      </View>

      <Text style={[s.brand, androidTight]} numberOfLines={1}>
        {brand}
      </Text>
      <Text style={[s.title, androidTight]} numberOfLines={2}>
        {title}
      </Text>
    </Pressable>
  );
}

export const GifticonCard = memo(GifticonCardImpl);

const s = StyleSheet.create({
  card: { flex: 1 },
  thumbWrap: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: colors.GRAY_LIGHT,
  },
  thumb: { width: "100%", height: "100%" },

  brand: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 14,
    color: colors.GRAY_NORMAL,
  },
  title: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: colors.BLUE_DARKER,
    ...font.bold,
    textAlignVertical: "center",
    paddingVertical: 0,
    marginBottom: 5,
  },
});
