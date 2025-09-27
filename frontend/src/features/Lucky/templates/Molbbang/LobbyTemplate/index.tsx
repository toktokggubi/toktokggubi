import React from "react";
import { View, Text, Pressable } from "react-native";
import { AppHeader } from "@/shared/ui/AppHeader";
import { s } from "./variants";
import { font } from "@/shared/typography/font";
import type { LobbyTemplateProps } from "./types";
import CopyIcon from "@/assets/icon/copy.svg"; // ✅ SVG 불러오기

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
    onCopyCode,
    showStartButton = true,
  } = props;

  return (
    <View style={s.container}>
      <AppHeader title="몰빵" />

      {/* 총 금액 박스 */}
      <View style={s.topArea}>
        <Text style={s.topGuide}>이번 게임의 몰빵 금액은</Text>
        <Text style={s.amountNum}>
          {amount.toLocaleString()}
          <Text style={s.amountWon}> 원</Text>
        </Text>

        {/* 방 코드 + 복사 버튼 */}
        <View style={s.codeRow}>
          <Text style={s.codeText}>
            방 코드 <Text style={s.codeBold}>#{code}</Text>
          </Text>
          <Pressable
            onPress={onCopyCode}
            disabled={!onCopyCode}
            style={({ pressed }) => [
              s.copyBtn,
              !onCopyCode && s.copyBtnDisabled,
              pressed && s.copyBtnPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="방 코드 복사"
          >
            <CopyIcon width={20} height={20} />
          </Pressable>
        </View>
      </View>

      {/* 게임 정보 헤더 */}
      <View style={s.sectionHeader}>
        <Text style={[s.sectionTitle, font.bold]}>게임 참여자</Text>
        <Text style={s.sectionMeta}>현재 인원수 {presentCount}명</Text>
      </View>

      {/* 참여자 카드 */}
      <View style={s.memberCard}>
        {members.map((m, idx) => {
          const isLast = idx === members.length - 1;
          return (
            <View
              key={m.userId}
              style={[
                s.memberItem,
                isLast && { borderBottomWidth: 0 }, // 마지막은 밑줄 제거
              ]}
            >
              <View style={s.memberLeft}>
                <View style={[s.dot, m.online ? s.dotOn : s.dotOff]} />
                <Text style={s.memberName}>
                  {m.nickname}
                  {m.nickname === meNickname ? "(나)" : ""}
                </Text>
              </View>
              <View style={[s.badge, m.ready ? s.badgeReady : s.badgeWaiting]}>
                <Text
                  style={[
                    s.badgeTxt,
                    m.ready ? s.badgeReadyTxt : s.badgeWaitingTxt,
                  ]}
                >
                  {m.ready ? "준비완료" : "준비중"}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* 하단 CTA: 위아래 배치 */}
      <View style={s.ctaArea}>
        <Pressable
          onPress={onToggleReady}
          style={[s.btn, s.btnGhost, !myReady && s.btnDisabledIfDesign]} // 시안처럼 회색 비활성 느낌
          accessibilityRole="button"
          accessibilityLabel={myReady ? "준비 해제" : "준비"}
        >
          <Text style={[s.btnGhostTxt]}>{myReady ? "준비 해제" : "준비"}</Text>
        </Pressable>

        {showStartButton ? (
          <Pressable
            onPress={canStart ? onStart : undefined}
            disabled={!canStart}
            style={[s.btn, s.btnPrimary, !canStart && s.btnDisabled]}
            accessibilityRole="button"
            accessibilityLabel="게임 시작"
          >
            <Text style={s.btnPrimaryTxt}>게임 시작</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
