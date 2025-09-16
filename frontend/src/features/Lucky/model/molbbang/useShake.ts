import { useEffect, useRef, useState } from "react";
import { Accelerometer } from "expo-sensors";

interface UseShakeOptions {
  sampleHz?: number; // 샘플링 Hz
  smoothing?: number; // 지수평활 (0~1)
  shakeThreshold?: number; // "흔들림으로 카운트" 기준
}

export function useShake(opts?: UseShakeOptions) {
  const sampleHz = opts?.sampleHz ?? 60;
  const smoothing = opts?.smoothing ?? 0.2;
  const shakeThreshold = opts?.shakeThreshold ?? 0.9; // 가속도 크기(중력보정X) 기준

  const [magnitude, setMagnitude] = useState(0);
  const [shakeValue, setShakeValue] = useState(0); // 누적치 (라운드마다 0으로 리셋)
  const smoothed = useRef(0);

  useEffect(() => {
    let subscription: any;
    Accelerometer.setUpdateInterval(1000 / sampleHz);

    subscription = Accelerometer.addListener(({ x, y, z }) => {
      const mag = Math.sqrt(x * x + y * y + z * z); // 중력 포함
      smoothed.current =
        smoothed.current + (mag - smoothed.current) * smoothing;
      setMagnitude(smoothed.current);
      if (smoothed.current > shakeThreshold) {
        // 초과분만 더해도 되고, 그냥 1틱씩 더해도 됨
        setShakeValue((v) => v + (smoothed.current - shakeThreshold));
      }
    });

    return () => subscription?.remove?.();
  }, [sampleHz, smoothing, shakeThreshold]);

  const reset = () => setShakeValue(0);

  return { magnitude, shakeValue, reset };
}
