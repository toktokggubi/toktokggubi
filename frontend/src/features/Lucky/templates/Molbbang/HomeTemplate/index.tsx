import React, { useRef, useEffect } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video"; // ✅ player hook도 가져옴
import { s } from "./variants";
import type { MolbbangHomeTemplateProps } from "./types";
import { AppHeader } from "@/shared/ui/AppHeader";

export default function MolbbangHomeTemplate({
  onPressCreate,
  onPressJoin,
  bgImg,
  danceVideo,
}: MolbbangHomeTemplateProps) {
  // ✅ player 생성
  const player = useVideoPlayer(danceVideo, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  return (
    <View style={s.root}>
      {/* 🔹 비디오 + 배경 이미지 */}
      <VideoView
        style={s.video}
        player={player} // ✅ source 대신 player 전달
        contentFit="cover" // ResizeMode 대체
        nativeControls={false} // 필요시 true
      />
      <Image source={bgImg} style={s.background} resizeMode="cover" />

      <AppHeader title="몰빵" />

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
