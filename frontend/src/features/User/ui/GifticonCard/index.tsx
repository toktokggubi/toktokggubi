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
  android: { includeFontPadding: false },
  default: {},
})!;

function GifticonCardImpl({
  imageSource,
  title,
  brand,
  onPress,
  dDay,
}: GifticonCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={s.card}
      android_ripple={{ borderless: false }}
      accessibilityLabel={`${brand} ${title}${
        typeof dDay === "number" ? `, D-${Math.max(0, dDay)}` : ""
      }`}
    >
      <View style={s.thumbWrap}>
        {/* D-Day Badge */}
        {typeof dDay === "number" && (
          <View style={s.badge}>
            <Text style={[s.badgeTxt, androidTight]}>
              {dDay > 0
                ? `D-${dDay}`
                : dDay === 0
                ? "D-DAY"
                : `D+${Math.abs(dDay)}`}
            </Text>
          </View>
        )}

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
    position: "relative",
  },
  thumb: { width: "100%", height: "100%" },

  // ⬇ 배지 스타일
  badge: {
    position: "absolute",
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.GRAY_DARK_ACTIVE, // 어두운 회색 배경
    opacity: 0.9,
    zIndex: 2,
  },
  badgeTxt: {
    ...font.bold,
    fontSize: 10,
    lineHeight: 12,
    color: "#fff",
  },

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
