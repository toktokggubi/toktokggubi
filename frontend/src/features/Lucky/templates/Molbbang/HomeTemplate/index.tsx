// src/features/Lucky/templates/Molbbang/HomeTemplate/index.tsx
import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { s } from "./variants";
import type { MolbbangHomeTemplateProps } from "./types";
import { AppHeader } from "@/shared/ui/AppHeader"; // ✅ 추가

export default function MolbbangHomeTemplate({
  onPressCreate,
  onPressJoin,
  bgImg,
  danceVideo,
}: MolbbangHomeTemplateProps) {
  return (
    <View style={s.root}>
      {/* 🔹 비디오 + 배경 이미지 */}
      <Video
        source={danceVideo}
        style={s.video}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay
        isMuted
      />
      <Image source={bgImg} style={s.background} resizeMode="cover" />

      {/* 🔹 CardScreen 스타일 헤더 */}
      <AppHeader
        title="몰빵"
        // showBack={true} // 기본값 true
        // onSelectImport={() => {}} // 필요 시 붙임
        // onSelectDelete={() => {}} // 필요 시 붙임
      />

      {/* 🔹 본문 컨테이너 */}
      <View style={s.container}>
        <View style={s.titleBox}>
          <Text style={s.titleTxt}>- - - 몰 빵 - - -</Text>
        </View>

        <View style={s.btnRow}>
          <Pressable style={[s.btn, s.primary]} onPress={onPressCreate}>
            <Text style={[s.btnTxt, s.primaryTxt]}>방 만들기</Text>
          </Pressable>
          <Pressable style={s.btn} onPress={onPressJoin}>
            <Text style={s.btnTxt}>코드로 참가</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
