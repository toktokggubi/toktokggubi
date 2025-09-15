import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import type { ImageSourcePropType } from "react-native";
import { FloatyCharacter } from "@/features/Lucky/ui/FloatyCharacter";
import { colors } from "@/shared/constants/colors";
import { font } from "@/shared/typography/font";

interface MolbbangRoomTemplateProps {
  code: string;
  amount: number;
  status: "lobby" | "countdown" | "playing" | "finished";
  round: number;
  magnitude: number;
  myScore: number;
  onStart: () => void;
  onFinishRound: () => void;
  onShareLink: () => void;
  onShowQr: () => void;

  idleImage: ImageSourcePropType;
  shakeImage: ImageSourcePropType;
}

export default function MolbbangRoomTemplate({
  code,
  amount,
  status,
  round,
  magnitude,
  myScore,
  onStart,
  onFinishRound,
  onShareLink,
  onShowQr,
  idleImage,
  shakeImage,
}: MolbbangRoomTemplateProps) {
  return (
    <View style={s.container}>
      <Text style={[s.h1, font.bold]}>몰빵 방 #{code}</Text>
      <Text style={s.sub}>
        금액: {amount.toLocaleString()}원 • 라운드 {round}
      </Text>

      <View style={{ height: 24 }} />

      {/* 캐릭터 */}
      <FloatyCharacter
        idleImage={idleImage}
        shakeImage={shakeImage}
        magnitude={magnitude}
      />

      <View style={{ height: 16 }} />
      <Text style={s.score}>내 흔들기: {Math.round(myScore)}</Text>

      <View style={{ height: 24 }} />

      {status === "lobby" && (
        <View style={s.row}>
          <Pressable
            style={s.btn}
            onPress={onShareLink}
            accessibilityLabel="링크 공유"
          >
            <Text style={s.btnTxt}>링크 공유</Text>
          </Pressable>
          <Pressable
            style={s.btn}
            onPress={onShowQr}
            accessibilityLabel="QR 공유"
          >
            <Text style={s.btnTxt}>QR</Text>
          </Pressable>
          <Pressable
            style={[s.btn, s.primary]}
            onPress={onStart}
            accessibilityLabel="시작하기"
          >
            <Text style={[s.btnTxt, s.primaryTxt]}>시작</Text>
          </Pressable>
        </View>
      )}

      {status === "playing" && (
        <Pressable
          style={[s.btn, s.primary]}
          onPress={onFinishRound}
          accessibilityLabel="종료"
        >
          <Text style={[s.btnTxt, s.primaryTxt]}>라운드 종료</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBFF",
    alignItems: "center",
    paddingTop: 24,
  },
  h1: { fontSize: 20, color: colors.BLUE_DARKER },
  sub: { fontSize: 14, color: colors.BLUE_DARK },
  score: { fontSize: 16, color: colors.BLUE_DARKER },
  row: { flexDirection: "row", gap: 12 },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.GRAY_LIGHT,
  },
  btnTxt: { fontSize: 14, color: colors.BLUE_DARKER, ...font.medium },
  primary: { backgroundColor: colors.BLUE_NORMAL },
  primaryTxt: { color: "white" },
});
