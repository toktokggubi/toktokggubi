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
  sampleHz = 60,
  smoothing = 0.2,
  shakeThreshold = 1.0,
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
        // 하지만 너무 빠르게 증가하지 않도록 제한
        const scoreIncrement = Math.min(next * 2, 1); // 최대 1점씩만 증가
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
