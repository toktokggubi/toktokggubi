import { useEffect, useRef } from "react";
import { Accelerometer } from "expo-sensors";

type Options = {
  enabled?: boolean; // 훅 활성화 여부
  sampleMs?: number; // 샘플링 주기 (작을수록 민감)
  thresholdG?: number; // 임계값(클수록 둔감)
  minShakes?: number; // 임계 초과 연속 횟수
  windowMs?: number; // 연속 판정 시간창
  cooldownMs?: number; // 재트리거 대기
  lowPassAlpha?: number; // 로우패스(노이즈 억제)
};

export function useShakeAdvanced(onShake: () => void, opts: Options = {}) {
  const {
    enabled = true,
    sampleMs = 50,
    thresholdG = 1.4,
    minShakes = 5,
    windowMs = 450,
    cooldownMs = 1200,
    lowPassAlpha = 0.88,
  } = opts;

  const lastTrigger = useRef(0);
  const lpX = useRef(0),
    lpY = useRef(0),
    lpZ = useRef(0);
  const hits = useRef<number[]>([]);

  useEffect(() => {
    if (!enabled) return;

    Accelerometer.setUpdateInterval(sampleMs);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      // Low-pass (중력/느린 변화)
      lpX.current = lowPassAlpha * lpX.current + (1 - lowPassAlpha) * x;
      lpY.current = lowPassAlpha * lpY.current + (1 - lowPassAlpha) * y;
      lpZ.current = lowPassAlpha * lpZ.current + (1 - lowPassAlpha) * z;

      // High-pass (급격 변화)
      const hx = x - lpX.current;
      const hy = y - lpY.current;
      const hz = z - lpZ.current;
      const g = Math.sqrt(hx * hx + hy * hy + hz * hz);

      const now = Date.now();
      if (now - lastTrigger.current < cooldownMs) return;

      if (g >= thresholdG) hits.current.push(now);
      const cutoff = now - windowMs;
      hits.current = hits.current.filter((t) => t >= cutoff);

      if (hits.current.length >= minShakes) {
        lastTrigger.current = now;
        hits.current = [];
        onShake();
      }
    });
    return () => sub.remove();
  }, [
    enabled,
    onShake,
    sampleMs,
    thresholdG,
    minShakes,
    windowMs,
    cooldownMs,
    lowPassAlpha,
  ]);
}
