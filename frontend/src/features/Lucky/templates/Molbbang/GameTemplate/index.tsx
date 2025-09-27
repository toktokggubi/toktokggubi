// src/features/Lucky/templates/Molbbang/GameTemplate/index.tsx
import React, { useCallback, useState } from "react";
import { View, Text, LayoutChangeEvent } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { AppHeader } from "@/shared/ui/AppHeader";
import { FloatyCharacter } from "@/features/Lucky/ui/FloatyCharacter";
import { s } from "./variants";
import type { GameTemplateProps } from "./types";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useFloatInBox,
  type BoxSize,
} from "@/features/Lucky/model/molbbang/useFloatInBox";

export default function GameTemplate({
  code,
  amount,
  round,
  magnitude,
  myScore,
  idleImage,
  shakeImage,
  onFinishRound,
  remainingSeconds,
}: GameTemplateProps) {
  // ── 캐릭터가 떠다닐 박스 크기 측정
  const [box, setBox] = useState<BoxSize | null>(null);
  const onBoxLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBox({ width, height });
  }, []);

  // ── 가속도 기반 위치 (중앙 기준 px 오프셋)
  const { x, y } = useFloatInBox(box, {
    enabled: true, // 모달이 없으므로 항상 활성화
    accelScale: 170,
    friction: 0.84,
    sampleHz: 90,
  });

  // ── 애니메이션 스타일(부드럽게 보정)
  const animStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateX: withSpring(x, {
            stiffness: 1000,
            damping: 18,
            mass: 0.3,
          }),
        },
        {
          translateY: withSpring(y, {
            stiffness: 1000,
            damping: 18,
            mass: 0.3,
          }),
        },
      ],
    }),
    [x, y]
  );

  return (
    <SafeAreaView style={s.container} edges={["left", "right"]}>
      <AppHeader title="몰빵" />

      {/* 안내문구 */}
      <Text style={s.hint}>휴대폰을 흔들어 점수를 높여보세요!</Text>

      {/* 큰 카운트 숫자 */}
      <Text style={s.bigScore}>{Math.round(myScore)}</Text>

      {/* 캐릭터 박스(여기가 '상자') */}
      <View style={s.centerArea} onLayout={onBoxLayout}>
        <Animated.View style={animStyle}>
          <FloatyCharacter
            idleImage={idleImage}
            shakeImage={shakeImage}
            magnitude={magnitude}
          />
        </Animated.View>
      </View>

      {/* 우하단 남은 시간 뱃지 */}
      <View style={s.timerBadge}>
        <Text style={s.timerTxt}>{Math.max(0, remainingSeconds)}</Text>
      </View>

      {/* 모달 제거 - 게임 종료 시 바로 결과 화면으로 이동 */}
    </SafeAreaView>
  );
}
