import React from "react";
import { View, Text } from "react-native";
import { AppHeader } from "@/shared/ui/AppHeader";
import { FloatyCharacter } from "@/features/Lucky/ui/FloatyCharacter";
import { s } from "./variants";
import type { GameTemplateProps } from "./types";

export default function GameTemplate({
  code,
  amount,
  round,
  magnitude,
  myScore,
  idleImage,
  shakeImage,
  onFinishRound,
  liveRanking,
}: GameTemplateProps) {
  return (
    <View style={s.container}>
      <AppHeader title={`몰빵 · 라운드 ${round}`} />
      <Text style={s.sub}>
        방 #{code} • 금액 {amount.toLocaleString()}원
      </Text>

      <View style={s.spacerLg} />
      <FloatyCharacter
        idleImage={idleImage}
        shakeImage={shakeImage}
        magnitude={magnitude}
      />
      <View style={s.spacerMd} />
      <Text style={s.score}>내 흔들기: {Math.round(myScore)}</Text>

      {/* 🔹 라운드 진행 중 현재까지 랭킹 */}
      <View style={s.spacerMd} />
      <View style={s.rankWrap}>
        <Text style={s.rankTitle}>현재까지 랭킹</Text>
        {liveRanking.map((r, i) => (
          <View key={r.userId} style={s.rankRow}>
            <Text style={[s.rankBadge]}>{i + 1}</Text>
            <Text style={[s.rankNick, r.isMe && s.me]}>
              {r.nickname}
              {r.isMe ? " (나)" : ""}
            </Text>
            <Text style={s.rankScore}>{r.total}</Text>
          </View>
        ))}
      </View>

      <View style={s.spacerLg} />
      <View style={[s.btn, s.primary]}>
        <Text onPress={onFinishRound} style={[s.btnTxt, s.primaryTxt]}>
          라운드 종료
        </Text>
      </View>
    </View>
  );
}
