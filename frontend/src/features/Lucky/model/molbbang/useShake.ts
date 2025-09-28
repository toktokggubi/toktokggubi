// src/features/Lucky/model/molbbang/useShake.ts
import { useEffect, useRef, useState } from "react";
import { Accelerometer } from "expo-sensors";

interface UseShakeOptions {
  sampleHz?: number;
  smoothing?: number;
  shakeThreshold?: number;
  enabled?: boolean;
}

export function useShake({
  sampleHz = 45, // 프로덕션에서 더 안정적인 주파수
  smoothing = 0.5, // 더 부드러운 스무딩
  shakeThreshold = 0.8, // 감도 조정
  enabled = true,
}: UseShakeOptions) {
  const [magnitude, setMagnitude] = useState(0);
  const [shakeValue, setShakeValue] = useState(0);
  const subRef = useRef<null | { remove: () => void }>(null);
  const smoothRef = useRef(0); // ✅ 최근 스무딩 값 보관

  useEffect(() => {
    Accelerometer.setUpdateInterval(1000 / sampleHz);
  }, [sampleHz]);

  useEffect(() => {
    // enabled가 꺼지면 구독만 끊고 값은 유지(라운드 종료 직후 점수 읽기용)
    if (!enabled) {
      subRef.current?.remove?.();
      subRef.current = null;
      setMagnitude(0);
      smoothRef.current = 0; // 화면 표시용만 리셋
      return;
    }

    subRef.current = Accelerometer.addListener(({ x, y, z }) => {
      const mag = Math.sqrt(x * x + y * y + z * z) - 1; // 대략 중력 보정
      const next = Math.max(
        0,
        (1 - smoothing) * smoothRef.current + smoothing * Math.abs(mag)
      );
      smoothRef.current = next;
      setMagnitude(next);

      if (next > shakeThreshold) {
        // 더 안정적인 점수 계산: magnitude 기반으로 점수 증가
        // 실제로 흔들어야만 점수가 올라가도록 제한
        const scoreIncrement = Math.min(next * 0.5, 0.3); // 최대 0.3점씩만 증가, 감도 낮춤
        setShakeValue((v) => v + scoreIncrement);
      }
    });

    return () => {
      subRef.current?.remove?.();
      subRef.current = null;
    };
  }, [enabled, smoothing, shakeThreshold]); // ✅ magnitude 제거

  const reset = () => {
    smoothRef.current = 0;
    setMagnitude(0);
    setShakeValue(0);
  };

  return { magnitude, shakeValue, reset };
}
