import React, { memo } from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import type { SeriesCardsProps } from "./types";
import { colors } from "@/shared/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { font } from "@/shared/typography/font";

function SeriesCardsImpl({
  onPressNbbang,
  onPressMolbbang,
  nImageSource,
  molImageSource,
}: SeriesCardsProps) {
  return (
    <View>
      <Text style={s.title}>빵빵 시리즈</Text>

      <View style={s.row}>
        {/* N빵 */}
        <Pressable
          style={s.card}
          onPress={onPressNbbang}
          accessibilityLabel="N빵 카드"
        >
          <Image source={nImageSource} style={s.illustN} resizeMode="contain" />
          <View style={s.head}>
            <Text style={s.headTitle}>N빵</Text>
          </View>
          <View style={s.body}>
            <Text style={s.desc}>함께 쓴 비용을{"\n"}공평하게! 편리하게!</Text>
            <View style={s.arrowWrap}>
              <Ionicons
                name="chevron-forward"
                size={22}
                color={colors.BLUE_LIGHT_ACTIVE}
              />
            </View>
          </View>
        </Pressable>

        {/* 몰빵 */}
        <Pressable
          style={s.card}
          onPress={onPressMolbbang}
          accessibilityLabel="몰빵 카드"
        >
          <Image
            source={molImageSource}
            style={s.illustMol}
            resizeMode="contain"
          />
          <View style={s.head}>
            <Text style={s.headTitle}>몰빵</Text>
          </View>
          <View style={s.body}>
            <Text style={s.desc}>
              한명이 전부 지불하는{"\n"}짜릿한 한판승부!
            </Text>
            <View style={s.arrowWrap}>
              <Ionicons
                name="chevron-forward"
                size={22}
                color={colors.BLUE_LIGHT_ACTIVE}
              />
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

export const SeriesCards = memo(SeriesCardsImpl);

const RADIUS = 28;

const s = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.BLUE_DARKER,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  card: {
    position: "relative",
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: RADIUS,
    shadowColor: "#929292ff",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  head: {
    backgroundColor: colors.BLUE_NORMAL,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
  },
  headTitle: {
    fontSize: 20,
    color: "#fff",
    ...font.bold,
  },
  body: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 18,
    minHeight: 108,
    borderBottomLeftRadius: RADIUS,
    borderBottomRightRadius: RADIUS,
    flex: 1,
    flexDirection: "column", // 세로 배치
    justifyContent: "space-between", // 위-아래로 배치
  },
  desc: {
    color: colors.GRAY_NORMAL,
    fontSize: 14,
    lineHeight: 18,
  },
  arrowWrap: {
    alignItems: "flex-end",
  },
  illustN: {
    position: "absolute",
    right: -8,
    top: -26,
    width: 100,
    height: 100,
    zIndex: 1,
  },
  illustMol: {
    position: "absolute",
    right: -6,
    top: -25,
    width: 100,
    height: 100,
    zIndex: 1,
  },
});
