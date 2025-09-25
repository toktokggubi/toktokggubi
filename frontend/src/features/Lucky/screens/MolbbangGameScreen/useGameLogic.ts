// src/features/Lucky/screens/MolbbangGameScreen/useGameLogic.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import {
  molbbangApi,
  type MolbbangRoom,
} from "@/features/Lucky/api/molbbangService";
import { useShake } from "@/features/Lucky/model/molbbang/useShake";
import { isRoom, GAME_CONSTANTS } from "./utils";
import type { GameState } from "./useGameState";

interface UseGameLogicProps {
  code: string;
  nickname: string;
  amount: number;
  hostFlagFromParams: boolean;
  gameStateRef: React.MutableRefObject<GameState>;
  timerRef: React.MutableRefObject<number | null>;
  countdownRef: React.MutableRefObject<number | null>;
  setRemainingSeconds: (seconds: number) => void;
  setCurrentScore: (score: number) => void;
  setRankModalVisible: (visible: boolean) => void;
  setRankModalData: (data: any[]) => void;
  setIsFinalRound: (isFinal: boolean) => void;
}

export function useGameLogic({
  code,
  nickname,
  amount,
  hostFlagFromParams,
  gameStateRef,
  timerRef,
  countdownRef,
  setRemainingSeconds,
  setCurrentScore,
  setRankModalVisible,
  setRankModalData,
  setIsFinalRound,
}: UseGameLogicProps) {
  const router = useRouter();
  const [room, setRoom] = useState<MolbbangRoom | null>(null);

  // 함수들을 ref로 참조하여 의존성 문제 해결
  const setRemainingSecondsRef = useRef(setRemainingSeconds);
  const setCurrentScoreRef = useRef(setCurrentScore);
  const setRankModalVisibleRef = useRef(setRankModalVisible);
  const setRankModalDataRef = useRef(setRankModalData);
  const setIsFinalRoundRef = useRef(setIsFinalRound);

  // 라운드 중복 시작 방지 및 종료시각 기반 카운트다운 관리
  const startedRoundRef = useRef<number | null>(null);
  const roundEndAtRef = useRef<number | null>(null);
  const startLockUntilRef = useRef<number>(0);
  const isStartingRef = useRef<boolean>(false); // 시작 중 플래그

  // ref 업데이트
  setRemainingSecondsRef.current = setRemainingSeconds;
  setCurrentScoreRef.current = setCurrentScore;
  setRankModalVisibleRef.current = setRankModalVisible;
  setRankModalDataRef.current = setRankModalData;
  setIsFinalRoundRef.current = setIsFinalRound;

  // 흔들기 센서
  const { magnitude, shakeValue, reset } = useShake({
    sampleHz: 60,
    smoothing: 0.2,
  });

  // 라운드 종료 처리
  const handleFinishRound = useCallback(async () => {
    if (
      gameStateRef.current.isProcessingFinish ||
      gameStateRef.current.hasShownModal ||
      !gameStateRef.current.isGameActive
    ) {
      console.log("🔍 [라운드 종료] 이미 처리 중 - 무시");
      return;
    }

    // 즉시 처리 중 플래그 설정
    gameStateRef.current.isProcessingFinish = true;
    gameStateRef.current.hasShownModal = true;

    // 타이머 즉시 정리
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    gameStateRef.current.isProcessingFinish = true;
    gameStateRef.current.isTimerRunning = false;

    try {
      const me = room?.members.find((m) => m.nickname === nickname);
      const finalScore = Math.round(shakeValue);
      const totals = me ? { [me.userId]: finalScore } : {};

      const res = await molbbangApi.finishRound(code, { totals });

      if (res.ok) {
        // 서버 상태 반영
        setRoom((prevRoom: MolbbangRoom | null) => {
          const newStatus =
            res.status === "lobby"
              ? "lobby"
              : res.status === "finished"
              ? "finished"
              : "playing";
          const newRound = res.round || prevRoom?.round || 1;

          return prevRoom
            ? {
                ...prevRoom,
                status: newStatus,
                round: newRound,
              }
            : null;
        });

        // 모달 표시
        const members = room?.members || [];
        let rankingData;

        if (members.length === 0) {
          rankingData = [
            {
              userId: "current_user",
              nickname: nickname,
              total: finalScore,
            },
          ];
        } else {
          rankingData = members.map((member) => ({
            userId: String(member.userId),
            nickname: member.nickname,
            total: finalScore,
          }));
        }

        // 모달 표시 (이미 hasShownModal은 위에서 true로 설정됨)
        setRankModalDataRef.current(rankingData);
        setIsFinalRoundRef.current(res.status === "finished");
        setRankModalVisibleRef.current(true);
      } else {
        // 실패 시 대기방으로 이동
        router.replace({
          pathname: "/molbbang/room/[code]",
          params: {
            code,
            nick: nickname,
            amount,
            host: hostFlagFromParams ? "1" : "0",
          },
        });
      }
    } catch (error) {
      console.error("🔍 라운드 종료 에러:", error);
      router.replace({
        pathname: "/molbbang/room/[code]",
        params: {
          code,
          nick: nickname,
          amount,
          host: hostFlagFromParams ? "1" : "0",
        },
      });
    } finally {
      gameStateRef.current.isProcessingFinish = false;
    }
  }, [code, nickname, amount, hostFlagFromParams, room, shakeValue, router]);

  // 게임 종료
  const stopGame = useCallback(() => {
    gameStateRef.current.isGameActive = false;
    gameStateRef.current.isTimerRunning = false;
    gameStateRef.current.isProcessingFinish = false;
    gameStateRef.current.hasShownModal = false;
    gameStateRef.current.isStartingGame = false;

    // 락 해제
    isStartingRef.current = false;
    startedRoundRef.current = null;
    roundEndAtRef.current = null;
    startLockUntilRef.current = 0;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  // 폴링
  useEffect(() => {
    if (!code || gameStateRef.current.hasShownModal) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        // 모달이 표시되거나 게임이 활성화된 상태에서는 폴링하지 않음
        if (
          gameStateRef.current.hasShownModal ||
          gameStateRef.current.isGameActive
        ) {
          return;
        }

        const r = await molbbangApi.fetchRoom(code);
        if (isRoom(r)) {
          setRoom(r);
        }
      } catch {
        // ignore
      }
    }, GAME_CONSTANTS.POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [code]);

  // 게임 시작 감지
  useEffect(() => {
    if (!room || room.status !== "playing") return;

    const currentRound = typeof room.round === "number" ? room.round : null;
    const roundChanged =
      currentRound !== null && currentRound !== startedRoundRef.current;

    const canStartGame =
      roundChanged &&
      !gameStateRef.current.isGameActive &&
      !gameStateRef.current.hasShownModal &&
      !gameStateRef.current.isProcessingFinish &&
      !gameStateRef.current.isTimerRunning &&
      !gameStateRef.current.isStartingGame &&
      !isStartingRef.current;

    if (canStartGame) {
      console.log("🔍 [게임 시작] 감지 - startGame() 호출");

      // 즉시 락 설정 (중복 실행 방지)
      if (isStartingRef.current) {
        console.log("🔍 [게임 시작] 이미 시작 중 - 무시");
        return;
      }

      isStartingRef.current = true;

      gameStateRef.current.isStartingGame = true;
      gameStateRef.current.isGameActive = true;
      gameStateRef.current.isTimerRunning = true;
      gameStateRef.current.isProcessingFinish = false;
      gameStateRef.current.hasShownModal = false;

      // 라운드 식별자 및 종료시각 고정
      startedRoundRef.current = currentRound ?? startedRoundRef.current ?? 1;
      roundEndAtRef.current = Date.now() + GAME_CONSTANTS.ROUND_MS;
      // 시작 직후 서버 상태 요동(playing/lobby 튐) 무시 구간
      startLockUntilRef.current = Date.now() + 1500;

      setCurrentScoreRef.current(0);
      const initialRemaining = Math.max(
        0,
        Math.ceil(((roundEndAtRef.current ?? 0) - Date.now()) / 1000)
      );
      setRemainingSecondsRef.current(initialRemaining);
      reset();

      // 라운드 종료 예약
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        void handleFinishRound();
      }, GAME_CONSTANTS.ROUND_MS);

      // 종료시각 기반 카운트다운
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      countdownRef.current = setInterval(() => {
        if (!roundEndAtRef.current) return;
        const remainingMs = roundEndAtRef.current - Date.now();
        const next = Math.max(0, Math.ceil(remainingMs / 1000));
        setRemainingSecondsRef.current(next);
      }, 100);

      gameStateRef.current.isStartingGame = false;
      isStartingRef.current = false; // 락 해제
    }
  }, [room?.status, room?.round]); // 의존성 최소화

  // 게임 종료 감지 (시작 직후 상태 요동은 무시)
  useEffect(() => {
    if (!room) return;
    if (Date.now() < startLockUntilRef.current) return;

    if (room.status === "finished" && gameStateRef.current.isGameActive) {
      stopGame();
    } else if (room.status === "lobby" && gameStateRef.current.isGameActive) {
      stopGame();
    }
  }, [room?.status, stopGame]);

  // 점수 업데이트
  useEffect(() => {
    if (!gameStateRef.current.isGameActive) return;

    const score = Math.round(shakeValue);
    setCurrentScoreRef.current(score);
  }, [shakeValue]);

  return {
    room,
    magnitude,
    shakeValue,
    handleFinishRound,
    stopGame,
  };
}
