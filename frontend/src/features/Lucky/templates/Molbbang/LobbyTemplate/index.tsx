import React from "react";
import { View, Text } from "react-native";
import { AppHeader } from "@/shared/ui/AppHeader";
import { s } from "./variants";
import { font } from "@/shared/typography/font";
import type { LobbyTemplateProps } from "./types";

export default function LobbyTemplate(props: LobbyTemplateProps) {
  const {
    code,
    amount,
    round,
    totalRounds,
    members,
    presentCount,
    meNickname,
    myReady,
    allReady,
    canStart,
    onToggleReady,
    onStart,
  } = props;

  return (
    <View style={s.container}>
      <AppHeader title="몰빵" />
      <Text style={[s.h1, font.bold]}>방 코드 #{code}</Text>
      <Text style={s.sub}>
        금액: {amount.toLocaleString()}원 • 라운드 {round}/{totalRounds} • 인원{" "}
        {presentCount}명
      </Text>

      <View
        style={s.memberRow}
        accessibilityLabel={`현재 ${presentCount}명 접속`}
      >
        {members.map((m) => {
          const isMe = m.nickname === meNickname;
          const name = `${m.nickname}${isMe ? " (나)" : ""}${
            m.ready ? " ✅" : ""
          }`;
          return (
            <View
              key={m.userId}
              style={[s.pill, m.online ? s.pillOnline : s.pillOffline]}
            >
              <View style={[s.dot, m.online ? s.dotOn : s.dotOff]} />
              <Text style={s.pillTxt}>{name}</Text>
            </View>
          );
        })}
      </View>

      <View style={s.spacerSm} />
      <View style={s.rowCenter}>
        <Text style={s.sub}>
          내 상태:{" "}
          <Text style={[s.sub, myReady ? s.readyOnTxt : s.readyOffTxt]}>
            {myReady ? "준비 완료 ✅" : "대기 중 ⏳"}
          </Text>
        </Text>
      </View>

      <View style={s.spacerMd} />
      <View style={s.row}>
        <View style={[s.btn, myReady ? s.readyOn : s.readyOff]}>
          <Text
            onPress={onToggleReady}
            style={[s.btnTxt, myReady ? s.readyOnTxt : s.readyOffTxt]}
          >
            {myReady ? "준비 해제" : "준비"}
          </Text>
        </View>
        <View style={[s.btn, s.primary, !canStart && s.btnDisabled]}>
          <Text
            onPress={canStart ? onStart : undefined}
            style={[s.btnTxt, s.primaryTxt]}
          >
            시작
          </Text>
        </View>
      </View>

      {!allReady && (
        <>
          <View style={s.spacerSm} />
          <Text style={s.sub}>모두 준비해야 시작할 수 있어요.</Text>
        </>
      )}
    </View>
  );
}
