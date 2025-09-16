import React from "react";
import { View, Text, Pressable } from "react-native";
import { AppHeader } from "@/shared/ui/AppHeader";
import { s } from "./variants";
import type { ResultTemplateProps } from "./types";
import { font } from "@/shared/typography/font";
import { colors } from "@/shared/constants/colors";

export default function ResultTemplate({
  code,
  amount,
  ranking,
  myNickname,
  myRank,
  jackpotNickname,
  onBackToLobby,
}: ResultTemplateProps) {
  const first = ranking[0];
  const last = ranking[ranking.length - 1];

  return (
    <View style={s.container}>
      <AppHeader title="몰빵 · 결과" />
      <Text style={[s.h1, font.bold]}>최종 결과</Text>
      <Text style={s.sub}>
        방 #{code} • 총 {ranking.length}명
      </Text>

      <View style={s.card}>
        <Text style={s.rowTitle}>🏆 1등</Text>
        <Text style={s.rowText}>
          {first?.nickname ?? "-"} ({first?.total ?? 0})
        </Text>

        <View style={s.divider} />

        <Text style={s.rowTitle}>🎯 몰빵 당첨(꼴등)</Text>
        <Text
          style={[s.rowText, { color: colors.BLUE_NORMAL, fontWeight: "700" }]}
        >
          {jackpotNickname ?? last?.nickname ?? "-"} — {amount.toLocaleString()}
          원
        </Text>

        {myRank !== null && (
          <>
            <View style={s.divider} />
            <Text style={s.rowTitle}>나의 등수</Text>
            <Text style={s.rowText}>{myRank}등</Text>
          </>
        )}
      </View>

      <View style={s.list}>
        {ranking.map((r, i) => (
          <View key={r.userId} style={s.rankRow}>
            <Text style={s.badge}>{i + 1}</Text>
            <Text style={[s.nick, r.nickname === myNickname && s.me]}>
              {r.nickname}
              {r.nickname === myNickname ? " (나)" : ""}
            </Text>
            <Text style={s.score}>{r.total}</Text>
          </View>
        ))}
      </View>

      <Pressable style={[s.btn, s.primary]} onPress={onBackToLobby}>
        <Text style={[s.btnTxt, s.primaryTxt]}>대기방으로</Text>
      </Pressable>
    </View>
  );
}
