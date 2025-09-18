import React from "react";
import { View, Text, Modal, Pressable } from "react-native";
import { AppHeader } from "@/shared/ui/AppHeader";
import { FloatyCharacter } from "@/features/Lucky/ui/FloatyCharacter";
import { s } from "./variants";
import type { GameTemplateProps } from "./types";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function GameTemplate({
  code,
  amount,
  round,
  magnitude,
  myScore,
  idleImage,
  shakeImage,
  onFinishRound,

  rankModalVisible,
  rankModalData,
  isFinalRound,
  onNextRound,
  onViewFinal,
}: GameTemplateProps) {
  return (
    <SafeAreaView style={s.container} edges={["left", "right"]}>
      {/* 엣지-투-엣지: 상하단 인셋 무시 / 투명 StatusBar */}
      <StatusBar style="light" />

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

      <View style={s.spacerLg} />
      <View style={[s.btn, s.primary]}>
        <Text onPress={onFinishRound} style={[s.btnTxt, s.primaryTxt]}>
          라운드 종료
        </Text>
      </View>

      {/* 🔹 라운드 종료 모달(현재까지 랭킹) */}
      <Modal
        visible={rankModalVisible}
        animationType="fade"
        transparent
        onRequestClose={isFinalRound ? onViewFinal : onNextRound}
      >
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>
              {isFinalRound ? "최종 랭킹" : "현재까지 랭킹"}
            </Text>

            <View style={s.rankWrap}>
              {rankModalData.map((r, i) => (
                <View key={r.userId} style={s.rankRow}>
                  <Text style={s.rankBadge}>{i + 1}</Text>
                  <Text style={s.rankNick}>{r.nickname}</Text>
                  <Text style={s.rankScore}>{r.total}</Text>
                </View>
              ))}
            </View>

            <View style={s.modalBtns}>
              {isFinalRound ? (
                <Pressable style={[s.btn, s.primary]} onPress={onViewFinal}>
                  <Text style={[s.btnTxt, s.primaryTxt]}>결과 화면으로</Text>
                </Pressable>
              ) : (
                <Pressable style={[s.btn, s.primary]} onPress={onNextRound}>
                  <Text style={[s.btnTxt, s.primaryTxt]}>다음 라운드 준비</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
