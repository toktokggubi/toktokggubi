import React, { memo, useEffect, useRef } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  type ImageSourcePropType,
} from "react-native";

interface FloatyCharacterProps {
  idleImage: ImageSourcePropType;
  shakeImage: ImageSourcePropType;
  magnitude: number; // 가속도 크기
}

function FloatyCharacterImpl({
  idleImage,
  shakeImage,
  magnitude,
}: FloatyCharacterProps) {
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;

  // magnitude를 간단히 위치 변화로 매핑 (난수 약간 섞어 흔들흔들)
  useEffect(() => {
    const dx = (Math.random() - 0.5) * magnitude * 10; // 튜닝 포인트
    const dy = (Math.random() - 0.5) * magnitude * 10;
    Animated.spring(x, {
      toValue: dx,
      useNativeDriver: true,
      friction: 7,
      tension: 40,
    }).start();
    Animated.spring(y, {
      toValue: dy,
      useNativeDriver: true,
      friction: 7,
      tension: 40,
    }).start();
  }, [magnitude, x, y]);

  const isShaking = magnitude > 0.9; // 이미지 전환 기준 (훅과 동일 기준 사용 권장)
  const src = isShaking ? shakeImage : idleImage;

  return (
    <Animated.View
      style={[s.wrap, { transform: [{ translateX: x }, { translateY: y }] }]}
    >
      <Image source={src} style={s.img} resizeMode="contain" />
    </Animated.View>
  );
}

export const FloatyCharacter = memo(FloatyCharacterImpl);

const s = StyleSheet.create({
  wrap: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  img: { width: 220, height: 220 },
});
