import React from "react";
import { View, Text } from "react-native";
import type { RoomTemplateProps } from "./types";
import { FloatyCharacter } from "@/features/Lucky/ui/FloatyCharacter";
import { font } from "@/shared/typography/font";
import { s } from "./variants";
import { AppHeader } from "@/shared/ui/AppHeader";

export default function RoomTemplate({
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
  members,
  presentCount,
  meNickname,
  ranking,
  // ✅ 준비 토글
  myReady,
  canStart,
  allReady,
  onToggleReady,
}: RoomTemplateProps) {
  return (
    <View style={s.container}>
      <AppHeader title="몰빵" />

      {/* 방 정보 + 인원 */}
      <Text style={[s.h1, font.bold]}>방 코드 #{code}</Text>
      <Text style={s.sub}>
        금액: {amount.toLocaleString()}원 • 라운드 {round} • 인원 {presentCount}
        명
      </Text>

      {/* 참가자 닉네임 뱃지 */}
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

      <View style={s.spacerLg} />

      {/* 캐릭터 무대 */}
      <FloatyCharacter
        idleImage={idleImage}
        shakeImage={shakeImage}
        magnitude={magnitude}
      />

      <View style={s.spacerMd} />

      {/* 점수 */}
      <Text style={s.score}>내 흔들기: {Math.round(myScore)}</Text>

      <View style={s.spacerLg} />

      {/* 액션 영역 */}
      {status === "lobby" && (
        <>
          {/* ✅ 준비 토글 버튼 */}
          <View style={s.row}>
            <View style={[s.btn, myReady ? s.readyOn : s.readyOff]}>
              <Text
                onPress={onToggleReady}
                style={[s.btnTxt, myReady ? s.readyOnTxt : s.readyOffTxt]}
              >
                {myReady ? "준비 해제" : "준비"}
              </Text>
            </View>
          </View>

          <View style={s.spacerMd} />

          {/* 공유/QR/시작 */}
          <View style={s.row}>
            <Text
              style={s.visuallyHidden}
              accessibilityLabel="대기실 상태입니다. 준비 버튼을 눌러 준비를 완료하고, 모두 준비하면 시작할 수 있습니다."
            />
            <View style={s.btn}>
              <Text onPress={onShareLink} style={s.btnTxt}>
                링크 공유
              </Text>
            </View>
            <View style={s.btn}>
              <Text onPress={onShowQr} style={s.btnTxt}>
                QR
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
              <View style={s.spacerMd} />
              <Text style={s.sub}>모두 준비해야 시작할 수 있어요.</Text>
            </>
          )}
        </>
      )}

      {status === "playing" && (
        <View style={[s.btn, s.primary]}>
          <Text onPress={onFinishRound} style={[s.btnTxt, s.primaryTxt]}>
            라운드 종료
          </Text>
        </View>
      )}

      {/* 종료 결과 */}
      {status === "finished" && (
        <View style={s.resultsWrap}>
          <Text style={[s.resultsTitle, font.bold]}>최종 결과</Text>
          {ranking.map((r, idx) => (
            <View key={r.userId} style={s.resultRow}>
              <Text
                style={[
                  s.rankBadge,
                  idx === 0 && s.rankFirst,
                  idx === ranking.length - 1 && s.rankLast,
                ]}
              >
                {idx + 1}
              </Text>
              <Text style={[s.resultNick, r.isMe && s.me]}>
                {r.nickname}
                {r.isMe ? " (나)" : ""}
              </Text>
              <Text style={s.resultScore}>{r.final}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
