import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { AppHeader } from "@/shared/ui/AppHeader";
import { s } from "./variants";
import type { ResultTemplateProps } from "./types";

// 캐릭터 이미지
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
        <Text style={s.characterName}>{jackpotNickname ?? "-"}</Text>
        (이)가 <Text style={s.amount}>{amount.toLocaleString()}원</Text> 쏜다!
      </Text>

      {/* 캐릭터 + 닉네임 */}
      <View style={s.characterWrap}>
        <Image source={cryCharacter} style={s.characterImg} resizeMode="contain" />
      </View>

      {/* 최종 랭킹 박스 */}
      <View style={s.list}>
        <Text style={s.listTitle}>최종랭킹</Text>
        {ranking.length > 0 ? (
          ranking.map((r, i) => {
            const isMe = r.nickname === myNickname;
            const isJackpot = r.nickname === jackpotNickname;
            return (
              <View key={r.userId} style={[s.rankRow, isJackpot && s.rankRowLoser]}>
                <Text style={[s.badge, isJackpot && s.badgeLoser]}>{i + 1}</Text>

                <Text style={[s.nick, isMe && s.me, isJackpot && s.loserNick]} numberOfLines={1}>
                  {r.nickname}
                  {isMe ? " (나)" : ""}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  {isJackpot && <Text style={s.loserChip}>꼴등</Text>}
                  <Text style={[s.score, isJackpot && s.loserScore]}>{r.total}</Text>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={s.listLoading}>랭킹 데이터를 불러오는 중...</Text>
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
