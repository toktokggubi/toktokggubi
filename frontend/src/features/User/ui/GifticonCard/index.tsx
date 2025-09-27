// src/features/User/ui/GifticonCard/index.tsx
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";
import { Image as ExpoImage } from "expo-image";
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
import { handleImageError, handleImageLoad } from "@/features/User/utils/imageUtils";
import { isGifticonExpired, calculateDDay } from "@/features/User/utils/gifticonUtils";

const androidTight: TextStyle = Platform.select({
  android: { includeFontPadding: false },
  default: {},
})!;

function GifticonCardImpl({
  imageUrl,
  title,
  brand,
  expiresAt,
  onPress,
}: GifticonCardProps) {
  // 이미지 URL은 어댑터에서 이미 정규화됨
  
  // 만료 상태 및 D-Day 계산
  const isExpired = isGifticonExpired(expiresAt);
  const dDay = calculateDDay(expiresAt);


  return (
    <Pressable
      onPress={onPress}
      style={[s.card, isExpired && s.expiredCard]}
      android_ripple={{ borderless: false }}
      accessibilityLabel={`${brand} ${title}${
        isExpired ? ", 기간만료" : dDay !== null ? `, D-${dDay}` : ""
      }`}
    >
      <View style={[s.thumbWrap, isExpired && s.expiredThumbWrap]}>
        {/* D-Day Badge 또는 만료 Badge */}
        {isExpired ? (
          <View style={[s.badge, s.expiredBadge]}>
            <Text style={[s.badgeTxt, s.expiredBadgeTxt, androidTight]}>
              기간만료
            </Text>
          </View>
        ) : dDay !== null && (
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

        <ExpoImage
          source={imageUrl}
          style={[s.thumb, isExpired && s.expiredThumb]}
          contentFit="cover"
          contentPosition="top center"
          cachePolicy="disk"
          placeholder={require("@/assets/images/character/character-01.png")}
          onError={(e) => {
            handleImageError(imageUrl, e);
          }}
          onLoad={() => {
            handleImageLoad(imageUrl);
          }}
        />
      </View>

      <Text style={[s.brand, isExpired && s.expiredText, androidTight]} numberOfLines={1}>
        {brand}
      </Text>
      <Text style={[s.title, isExpired && s.expiredText, androidTight]} numberOfLines={2}>
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
  thumb: { 
    width: "100%", 
    height: "100%",
  },

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

  // ⬇ 만료된 기프티콘 스타일
  expiredCard: {
    // 전체 카드 투명도 제거 - 배지가 회색빛이 되는 것을 방지
  },
  expiredThumbWrap: {
    backgroundColor: colors.GRAY_LIGHT,
  },
  expiredThumb: {
    opacity: 0.5, // 이미지 회색빛
  },
  expiredBadge: {
    backgroundColor: "#e74c3c", // 더 선명한 빨간색 배지
    opacity: 1, // 완전 불투명
  },
  expiredBadgeTxt: {
    color: "#fff",
    fontWeight: "bold", // 더 굵게
  },
  expiredText: {
    color: colors.GRAY_NORMAL, // 텍스트 회색
  },
});
