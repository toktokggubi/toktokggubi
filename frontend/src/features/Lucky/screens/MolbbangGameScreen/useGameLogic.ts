// src/features/Lucky/screens/MolbbangGameScreen/useGameLogic.ts
import {
  molbbangApi,
  type MolbbangRoom,
} from "@/features/Lucky/api/molbbangService";
import { useShake } from "@/features/Lucky/model/molbbang/useShake";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GameState } from "./useGameState";
import { GAME_CONSTANTS, isRoom } from "./utils";

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
  currentScore: number;
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
  currentScore,
}: UseGameLogicProps) {
  const router = useRouter();
  const [room, setRoom] = useState<MolbbangRoom | null>(null);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);

  // refs to avoid stale closures
  const setRemainingSecondsRef = useRef(setRemainingSeconds);
  const setCurrentScoreRef = useRef(setCurrentScore);
  setRemainingSecondsRef.current = setRemainingSeconds;
  setCurrentScoreRef.current = setCurrentScore;

  // game control refs
  const gameEndAtRef = useRef<number | null>(null);
  const startLockUntilRef = useRef<number>(0);
  const isStartingRef = useRef<boolean>(false);
  const finalScoreRef = useRef<number>(0);
  const navigatedToResultRef = useRef<boolean>(false);

  // shake sensor
  const { magnitude, shakeValue, reset } = useShake({
    sampleHz: 45,
    smoothing: 0.5,
    shakeThreshold: 0.7,
    enabled: true,
  });

  // ===== Finish game (host ends; participants only submit & navigate) =====
  const handleFinishGame = useCallback(async () => {
    if (gameStateRef.current.isProcessingFinish || !gameStateRef.current.isGameActive) return;

    gameStateRef.current.isProcessingFinish = true;

    const finalScore = finalScoreRef.current;

    // clear timers immediately
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    gameStateRef.current.isTimerRunning = false;

    try {
      // try to map me (best-effort; not critical)
      let me: { nickname: string } | null = null;
      if (room?.members && room.members.length > 0) {
        me = room.members.find((m) => m.nickname === nickname) || room.members[0];
      }

      // stop accumulating score
      reset();
      gameStateRef.current.isGameActive = false;

      // submitting overlay
      setIsSubmittingScore(true);

      // submit score (both host & participant)
      if (me) {
        try {
          await molbbangApi.submitScore(finalScore);
        } catch (err) {
          // ignore; server may treat as already_submitted
        }
      }

      // allow others to submit
      await new Promise((r) => setTimeout(r, 3000));

      // host only: call end API
      const isHost = !!hostFlagFromParams;
      let endOk = false;
      if (isHost) {
        try {
          const endRes = await molbbangApi.finishRound();
          endOk = !!endRes?.ok;
        } catch {
          endOk = false;
        }
      }

      if (endOk) {
        // optimistically mark finished
        setRoom((prev) =>
          prev
            ? {
                ...prev,
                round: 1,
                status: "finished",
              }
            : null
        );

        // small wait for backend to aggregate
        await new Promise((r) => setTimeout(r, 500));

        try {
          const resultsRes = await molbbangApi.getResults();
          // regardless of success, go to results
        } catch {
          // ignore; navigate anyway
        }

        // full cleanup
        gameStateRef.current.isGameActive = false;
        gameStateRef.current.isTimerRunning = false;
        gameStateRef.current.isProcessingFinish = false;
        gameStateRef.current.isStartingGame = false;
        isStartingRef.current = false;
        gameEndAtRef.current = null;
        startLockUntilRef.current = 0;
        reset();

        // navigate to result (guard)
        if (navigatedToResultRef.current) return;
        navigatedToResultRef.current = true;
        router.replace({
          pathname: "/molbbang/room/[code]/result",
          params: {
            code,
            nick: nickname,
            amount,
            host: isHost ? "1" : "0",
          },
        });
        return;
      }

      // participant (or host end failed): go to result anyway
      if (!navigatedToResultRef.current) {
        navigatedToResultRef.current = true;
        router.replace({
          pathname: "/molbbang/room/[code]/result",
          params: {
            code,
            nick: nickname,
            amount,
            host: hostFlagFromParams ? "1" : "0",
          },
        });
      }
    } catch (error) {
      // on errors, do not bounce to lobby; go to result
      if (!navigatedToResultRef.current) {
        navigatedToResultRef.current = true;
        router.replace({
          pathname: "/molbbang/room/[code]/result",
          params: {
            code,
            nick: nickname,
            amount,
            host: hostFlagFromParams ? "1" : "0",
          },
        });
      }
    } finally {
      gameStateRef.current.isProcessingFinish = false;
      setIsSubmittingScore(false);
      isStartingRef.current = false;
    }
  }, [code, nickname, amount, hostFlagFromParams, room, router, gameStateRef, timerRef, countdownRef, reset]);

  // ===== stop game (local) =====
  const stopGame = useCallback(() => {
    gameStateRef.current.isGameActive = false;
    gameStateRef.current.isTimerRunning = false;
    gameStateRef.current.isProcessingFinish = false;
    gameStateRef.current.isStartingGame = false;

    isStartingRef.current = false;
    gameEndAtRef.current = null;
    startLockUntilRef.current = 0;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    // sensor reset happens at finish
  }, [gameStateRef, timerRef, countdownRef]);

  // ===== polling (fallback to WS) =====
  useEffect(() => {
    if (!code) return;

    let interval: ReturnType<typeof setInterval>;
    const startPolling = () => {
      const pollInterval = gameStateRef.current.isGameActive ? 1000 : GAME_CONSTANTS.POLLING_INTERVAL;
      interval = setInterval(async () => {
        try {
          const r = await molbbangApi.fetchRoom();
          if (isRoom(r)) setRoom(r);
        } catch {
          // ignore
        }
      }, pollInterval);
    };

    startPolling();

    const gameStateInterval = setInterval(() => {
      clearInterval(interval);
      startPolling();
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(gameStateInterval);
    };
  }, [code, gameStateRef]);

  // ===== start game when server says "playing" =====
  useEffect(() => {
    if (!room || room.status !== "playing") return;

    const canStartGame =
      !gameStateRef.current.isGameActive &&
      !gameStateRef.current.isProcessingFinish &&
      !gameStateRef.current.isTimerRunning &&
      !gameStateRef.current.isStartingGame &&
      !isStartingRef.current;

    if (!canStartGame) return;

    if (isStartingRef.current) return;
    isStartingRef.current = true;

    gameStateRef.current.isStartingGame = true;
    gameStateRef.current.isGameActive = true;
    gameStateRef.current.isTimerRunning = true;
    gameStateRef.current.isProcessingFinish = false;

    const gameStartTime = Date.now();
    gameEndAtRef.current = gameStartTime + GAME_CONSTANTS.GAME_MS;

    // ignore early status flaps
    startLockUntilRef.current = Date.now() + 500;

    const initialRemaining = Math.max(0, Math.ceil(((gameEndAtRef.current ?? 0) - Date.now()) / 1000));
    setRemainingSecondsRef.current(initialRemaining);
    reset();

    const timeUntilEnd = (gameEndAtRef.current ?? 0) - Date.now();
    if (timeUntilEnd > 0) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        void handleFinishGame();
      }, timeUntilEnd);
    } else {
      void handleFinishGame();
    }

    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      if (!gameEndAtRef.current) return;
      const remainingMs = gameEndAtRef.current - Date.now();
      const next = Math.max(0, Math.ceil(remainingMs / 1000));
      setRemainingSecondsRef.current(next);
      if (next <= 0 && countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    }, 100);

    gameStateRef.current.isStartingGame = false;
    // isStartingRef released on finish
  }, [room?.status, gameStateRef, timerRef, countdownRef, reset, handleFinishGame]);

  // ===== server-driven finish detection =====
  useEffect(() => {
    if (!room) return;
    if (Date.now() < startLockUntilRef.current) return;

    // server says finished
    if (room.status === "finished" && gameStateRef.current.isGameActive && !navigatedToResultRef.current) {
      if (navigatedToResultRef.current) return;
      navigatedToResultRef.current = true;

      setIsSubmittingScore(true);

      const handleServerFinish = async () => {
        try {
          const currentScore = finalScoreRef.current;
          try {
            await molbbangApi.submitScore(currentScore);
          } catch {}
          await new Promise((r) => setTimeout(r, 3000));
          try {
            await molbbangApi.getResults();
          } catch {}
        } finally {
          stopGame();
          setIsSubmittingScore(false);
          router.replace({
            pathname: "/molbbang/room/[code]/result",
            params: { code, nick: nickname, amount: String(amount) },
          });
        }
      };

      void handleServerFinish();
      return;
    }

    // host cancelled or error → host back to lobby only
    if (room.status === "lobby" && gameStateRef.current.isGameActive && hostFlagFromParams) {
      stopGame();
      router.replace({
        pathname: "/molbbang/room/[code]",
        params: { code, nick: nickname, amount, host: hostFlagFromParams ? "1" : "0" },
      });
    }

    // NOTE: participant "lobby → result" shortcut removed to avoid false positives
  }, [room?.status, stopGame, code, nickname, amount, router, gameStateRef, hostFlagFromParams]);

  // ===== timer-driven finish detection =====
  useEffect(() => {
    if (!gameStateRef.current.isGameActive || navigatedToResultRef.current) return;

    const checkTimer = () => {
      if (
        gameEndAtRef.current &&
        Date.now() >= gameEndAtRef.current &&
        gameStateRef.current.isGameActive &&
        !navigatedToResultRef.current
      ) {
        if (navigatedToResultRef.current) return;
        navigatedToResultRef.current = true;

        const handleParticipantFinish = async () => {
          setIsSubmittingScore(true);
          try {
            const currentScore = finalScoreRef.current;
            try {
              await molbbangApi.submitScore(currentScore);
            } catch {}
            await new Promise((r) => setTimeout(r, 3000));
            try {
              await molbbangApi.getResults();
            } catch {}
          } finally {
            stopGame();
            setIsSubmittingScore(false);
            router.replace({
              pathname: "/molbbang/room/[code]/result",
              params: { code, nick: nickname, amount: String(amount) },
            });
          }
        };

        void handleParticipantFinish();
      }
    };

    const interval = setInterval(checkTimer, 500);
    return () => clearInterval(interval);
  }, [gameStateRef, stopGame, code, nickname, amount, router]);

  // ===== live score update (only when active & not finishing) =====
  useEffect(() => {
    if (!gameStateRef.current.isGameActive || gameStateRef.current.isProcessingFinish) return;

    const score = Math.round(shakeValue);
    setCurrentScoreRef.current(score);
    finalScoreRef.current = score;
  }, [shakeValue, gameStateRef]);

  return {
    room,
    magnitude,
    shakeValue,
    handleFinishRound: handleFinishGame,
    stopGame,
    reset,
    isSubmittingScore,
  };
}
