// src/features/Lucky/templates/Molbbang/ResultTemplate/index.tsx
import React from "react";
import { View, Text, Pressable, Image } from "react-native"; // ✅ Image 추가
import { AppHeader } from "@/shared/ui/AppHeader";
import { s } from "./variants";
import type { ResultTemplateProps } from "./types";
import { font } from "@/shared/typography/font";
import { colors } from "@/shared/constants/colors";

// ✅ 캐릭터 이미지 import
const cryCharacter = require("@/assets/images/character/character-cry.png");

export default function ResultTemplate({
  code,
  amount,
  ranking,
  myNickname,
  myRank,
  jackpotNickname,
  onBackToLobby,
  onExit,
  isLoser,
  onPay,
}: ResultTemplateProps) {
  return (
    <View style={s.container}>
      <AppHeader title="몰빵" />

      {/* 상단 텍스트 */}
      <Text style={s.sub}>
        <Text style={s.characterName}>{jackpotNickname ?? "-"}</Text>(이)가{" "}
        <Text style={{ fontWeight: "700" }}>{amount.toLocaleString()}원</Text>{" "}
        쏜다!
      </Text>

      {/* 캐릭터 + 닉네임 */}
      <View style={s.characterWrap}>
        <Image
          source={cryCharacter}
          style={s.characterImg}
          resizeMode="contain"
        />
      </View>

      {/* 최종 랭킹 박스 */}
      <View style={s.list}>
        <Text style={s.listTitle}>최종랭킹</Text>
        {ranking.length > 0 ? (
          ranking.map((r, i) => (
            <View key={r.userId} style={s.rankRow}>
              <Text style={s.badge}>{i + 1}</Text>
              <Text style={[s.nick, r.nickname === myNickname && s.me]}>
                {r.nickname}
                {r.nickname === myNickname ? "(나)" : ""}
              </Text>
              <Text style={s.score}>{r.total}</Text>
            </View>
          ))
        ) : (
          <Text style={s.listTitle}>랭킹 데이터를 불러오는 중...</Text>
        )}
      </View>

      {/* CTA 버튼 */}
      {isLoser && onPay && (
        <Pressable style={[s.btn, s.pay]} onPress={onPay}>
          <Text style={[s.btnTxt, s.payTxt]}>결제하기</Text>
        </Pressable>
      )}
      {onExit && (
        <Pressable style={[s.btn, s.secondary]} onPress={onExit}>
          <Text style={[s.btnTxt, s.secondaryTxt]}>나가기</Text>
        </Pressable>
      )}
    </View>
  );
}
