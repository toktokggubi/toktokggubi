// src/features/Lucky/screens/MolbbangGameScreen/useGameState.ts
import { useRef, useState } from "react";

// 게임 상태 타입
export interface GameState {
  isGameActive: boolean;
  isTimerRunning: boolean;
  isProcessingFinish: boolean;
  isStartingGame: boolean;
}

// 게임 상태 관리 훅
export function useGameState() {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(10);
  const [currentScore, setCurrentScore] = useState<number>(0);

  // 타이머 refs
  const timerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  // 게임 상태 ref (중복 방지용)
  const gameStateRef = useRef<GameState>({
    isGameActive: false,
    isTimerRunning: false,
    isProcessingFinish: false,
    isStartingGame: false,
  });

  return {
    // 상태
    remainingSeconds,
    setRemainingSeconds,
    currentScore,
    setCurrentScore,

    // refs
    timerRef,
    countdownRef,
    gameStateRef,
  };
}
