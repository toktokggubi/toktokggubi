// src/features/Lucky/model/molbbang/useFloatInBox.ts
import { useEffect, useRef, useState } from "react";
import { Accelerometer } from "expo-sensors";

interface UseFloatInBoxOptions {
  enabled?: boolean;
  // 화면 좌표 보정
  accelScale?: number; // 가속도 → 속도 스케일
  friction?: number; // 속도 감쇠(0~1), 클수록 덜 미끄러짐
  sampleHz?: number; // 센서 폴링 주기
}

export interface BoxSize {
  width: number;
  height: number;
}
export interface FloatState {
  x: number;
  y: number;
} // 중심 기준 오프셋(px)

export function useFloatInBox(
  box: BoxSize | null,
  opts: UseFloatInBoxOptions = {}
): FloatState {
  const {
    enabled = true,
    accelScale = 65, // 흔들림 반응 세기
    friction = 0.9, // 감쇠
    sampleHz = 60,
  } = opts;

  const [pos, setPos] = useState<FloatState>({ x: 0, y: 0 });

  // 물리 상태
  const vx = useRef(0); // px/s (여기선 프레임 단위 근사)
  const vy = useRef(0);
  const px = useRef(0);
  const py = useRef(0);

  // 성능 최적화를 위한 이전 위치 저장
  const lastUpdateTime = useRef(0);

  // 박스 경계(중앙 기준 최대 이동량). 캐릭터의 반지름 여유로 48px 확보.
  const bounds = useRef<{ maxX: number; maxY: number }>({ maxX: 0, maxY: 0 });

  useEffect(() => {
    if (!box) return;
    // 캐릭터 크기(약 120px)와 안전 여백 감안해 클램프
    const margin = 48;
    bounds.current = {
      maxX: Math.max(0, box.width / 2 - margin),
      maxY: Math.max(0, box.height / 2 - margin),
    };
    // 박스 바뀌면 중앙으로 스냅
    px.current = 0;
    py.current = 0;
    vx.current = 0;
    vy.current = 0;
    setPos({ x: 0, y: 0 });
  }, [box?.width, box?.height]);

  useEffect(() => {
    Accelerometer.setUpdateInterval(1000 / sampleHz);
  }, [sampleHz]);

  useEffect(() => {
    if (!enabled || !box) return;

    const sub = Accelerometer.addListener(({ x, y }) => {
      const now = Date.now();

      // 프레임 제한: 16ms 간격으로 업데이트 (60fps)
      if (now - lastUpdateTime.current < 16) {
        return;
      }
      lastUpdateTime.current = now;

      // 좌표계 보정:
      // - x: 좌/우 기울기(우측으로 기울이면 +) → 화면에선 우측 +로 밀기
      // - y: 상/하 기울기(아래로 기울이면 +) → 화면에선 아래 +로 밀기
      // 휴대폰이 상자, 캐릭터는 안의 물체처럼 "기울이는 반대"로 미끄러져야 하므로 부호 반전
      vx.current += -x * (accelScale / sampleHz);
      vy.current += y * (accelScale / sampleHz);

      // 감쇠
      vx.current *= friction;
      vy.current *= friction;

      // 적분(프레임 근사)
      px.current += vx.current;
      py.current += vy.current;

      // 경계 충돌(벽 튕김 살짝)
      const { maxX, maxY } = bounds.current;
      if (px.current > maxX) {
        px.current = maxX;
        vx.current *= -0.4;
      }
      if (px.current < -maxX) {
        px.current = -maxX;
        vx.current *= -0.4;
      }
      if (py.current > maxY) {
        py.current = maxY;
        vy.current *= -0.4;
      }
      if (py.current < -maxY) {
        py.current = -maxY;
        vy.current *= -0.4;
      }

      // 상태 반영 - 최적화: 위치 변화가 충분할 때만 업데이트
      const newX = px.current;
      const newY = py.current;
      const currentPos = pos;

      // 위치 변화가 2px 이상일 때만 업데이트 (성능 최적화)
      if (
        Math.abs(newX - currentPos.x) > 2 ||
        Math.abs(newY - currentPos.y) > 2
      ) {
        setPos({ x: newX, y: newY });
      }
    });

    return () => sub.remove();
  }, [enabled, box, accelScale, friction, sampleHz, pos]);

  return pos;
}
