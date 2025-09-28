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
  currentScore: number; // 현재 점수 상태 추가
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

  // 함수들을 ref로 참조하여 의존성 문제 해결
  const setRemainingSecondsRef = useRef(setRemainingSeconds);
  const setCurrentScoreRef = useRef(setCurrentScore);

  // 라운드 중복 시작 방지 및 종료시각 기반 카운트다운 관리
  const startedRoundRef = useRef<number | null>(null);
  const roundEndAtRef = useRef<number | null>(null);
  const startLockUntilRef = useRef<number>(0);
  const isStartingRef = useRef<boolean>(false); // 시작 중 플래그
  const finalScoreRef = useRef<number>(0); // 게임 종료 시점의 최종 점수 보존

  // ref 업데이트
  setRemainingSecondsRef.current = setRemainingSeconds;
  setCurrentScoreRef.current = setCurrentScore;

  // 흔들기 센서 (항상 활성화, 게임 종료 시점에만 수동으로 리셋)
  const { magnitude, shakeValue, reset } = useShake({
    sampleHz: 45, // 프로덕션에서 안정적인 주파수
    smoothing: 0.5, // 더 부드러운 스무딩
    shakeThreshold: 0.7, // 적절한 감도
    enabled: true, // ← 항상 활성화
  });

  // 라운드 종료 처리
  const handleFinishRound = useCallback(async () => {
    if (
      gameStateRef.current.isProcessingFinish ||
      !gameStateRef.current.isGameActive
    ) {
      return;
    }

    // 즉시 처리 중 플래그 설정
    gameStateRef.current.isProcessingFinish = true;

    // 실시간으로 저장된 최종 점수 사용
    const finalScore = finalScoreRef.current;

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
      // 서버에서 받은 실제 닉네임으로 me 객체 찾기 (URL 파라미터 무시)
      let me = null;
      if (room?.members && room.members.length > 0) {
        // 현재 사용자의 닉네임으로 멤버 찾기
        me =
          room.members.find((member) => member.nickname === nickname) ||
          room.members[0];
      }

      // 점수 보존 후 즉시 센서 리셋 (점수 누적 방지)
      reset();

      // 게임 상태를 즉시 비활성화하여 점수 업데이트 방지
      gameStateRef.current.isGameActive = false;

      // 먼저 점수 제출
      if (me) {
        try {
          setIsSubmittingScore(true); // 로딩 시작
          await molbbangApi.submitScore(finalScore);
        } catch (error: any) {
        } finally {
          setIsSubmittingScore(false); // 로딩 종료
        }
      } else {
      }

      // 게임 종료 (바로 최종 결과로)
      const res = await molbbangApi.finishRound();

      if (res.ok) {
        // 게임 완료 상태로 처리 (라운드 없이 바로 최종 결과)
        // 서버 상태 반영 (room.status는 실제 DB 상태 유지)
        setRoom((prevRoom: MolbbangRoom | null) => {
          // 게임 완료 상태로 업데이트
          return prevRoom
            ? {
                ...prevRoom,
                round: 1, // 라운드는 항상 1
                status: "finished", // 바로 게임 완료 상태로
              }
            : null;
        });

        // 게임 완료 - 바로 최종 결과 조회
        // getResults API로 최종 결과 조회
        try {
          // 서버 상태가 업데이트될 때까지 잠시 대기
          await new Promise((resolve) => setTimeout(resolve, 500)); // 1초 → 0.5초로 단축

          const resultsRes = await molbbangApi.getResults();

          if (resultsRes.ok) {
            // 게임 완료 - 바로 결과 화면으로 이동
            // 게임 상태 완전 리셋
            gameStateRef.current.isGameActive = false;
            gameStateRef.current.isTimerRunning = false;
            gameStateRef.current.isProcessingFinish = false;
            gameStateRef.current.isStartingGame = false;

            // 락 해제
            isStartingRef.current = false;
            roundEndAtRef.current = null;
            startLockUntilRef.current = 0;

            // 타이머 정리
            if (timerRef.current) {
              clearTimeout(timerRef.current);
              timerRef.current = null;
            }
            if (countdownRef.current) {
              clearInterval(countdownRef.current);
              countdownRef.current = null;
            }

            // 센서 리셋
            reset();

            // 결과 화면으로 바로 이동
            const resultParams = {
              code,
              nick: nickname,
              amount,
              host: hostFlagFromParams ? "1" : "0",
            };

            router.replace({
              pathname: "/molbbang/room/[code]/result",
              params: resultParams,
            });
            return; // 성공 시 함수 종료
          } else {
            throw new Error("결과 조회 실패");
          }
        } catch (error: any) {
          // 에러 발생 시 폴백으로 진행
        }

        // 폴백: 서버 조회 실패 시에도 바로 결과 화면으로 이동
        // 게임 상태 완전 리셋
        gameStateRef.current.isGameActive = false;
        gameStateRef.current.isTimerRunning = false;
        gameStateRef.current.isProcessingFinish = false;
        gameStateRef.current.isStartingGame = false;

        // 락 해제
        isStartingRef.current = false;
        roundEndAtRef.current = null;
        startLockUntilRef.current = 0;

        // 타이머 정리
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }

        // 센서 리셋
        reset();

        // 결과 화면으로 바로 이동
        const resultParams = {
          code,
          nick: nickname,
          amount,
          host: hostFlagFromParams ? "1" : "0",
        };

        router.replace({
          pathname: "/molbbang/room/[code]/result",
          params: resultParams,
        });
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
      // 라운드 종료 에러
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
      // 게임 종료 시 락 해제 (다음 라운드 준비를 위해)
      isStartingRef.current = false;
    }
  }, [code, nickname, amount, hostFlagFromParams, room, shakeValue, router]);

  // 게임 종료
  const stopGame = useCallback(() => {
    gameStateRef.current.isGameActive = false;
    gameStateRef.current.isTimerRunning = false;
    gameStateRef.current.isProcessingFinish = false;
    gameStateRef.current.isStartingGame = false;

    // 락 해제
    isStartingRef.current = false;
    // startedRoundRef.current는 null로 초기화하지 않음 (다음 라운드 감지용)
    roundEndAtRef.current = null;
    startLockUntilRef.current = 0;

    // 타이머 정리
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    // 센서 리셋은 모달 표시 후에 수행 (점수 보존을 위해)
  }, []);

  // 폴링
  useEffect(() => {
    if (!code) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        // 모달이 표시되거나 게임이 활성화된 상태에서는 폴링하지 않음
        if (gameStateRef.current.isGameActive) {
          return;
        }

        const r = await molbbangApi.fetchRoom();
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
      currentRound !== null &&
      (startedRoundRef.current === null ||
        currentRound !== startedRoundRef.current);

    const canStartGame =
      roundChanged &&
      !gameStateRef.current.isGameActive &&
      !gameStateRef.current.isProcessingFinish &&
      !gameStateRef.current.isTimerRunning &&
      !gameStateRef.current.isStartingGame &&
      !isStartingRef.current;

    if (canStartGame) {
      // 즉시 락 설정 (중복 실행 방지)
      if (isStartingRef.current) {
        return;
      }

      isStartingRef.current = true;

      gameStateRef.current.isStartingGame = true;
      gameStateRef.current.isGameActive = true;
      gameStateRef.current.isTimerRunning = true;
      gameStateRef.current.isProcessingFinish = false;

      // 라운드 식별자 및 종료시각 고정
      startedRoundRef.current = currentRound ?? startedRoundRef.current ?? 1;
      roundEndAtRef.current = Date.now() + GAME_CONSTANTS.GAME_MS;
      // 시작 직후 서버 상태 요동(playing/lobby 튐) 무시 구간
      startLockUntilRef.current = Date.now() + 500; // 1.5초 → 0.5초로 단축

      // 점수는 센서 리셋과 함께 자동으로 0이 되므로 별도 초기화 불필요
      // setCurrentScoreRef.current(0); // 제거

      const initialRemaining = Math.max(
        0,
        Math.ceil(((roundEndAtRef.current ?? 0) - Date.now()) / 1000)
      );
      setRemainingSecondsRef.current(initialRemaining);
      reset(); // 센서 리셋으로 점수도 자동으로 0이 됨

      // 게임 종료 예약
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        void handleFinishRound();
      }, GAME_CONSTANTS.GAME_MS);

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
      // isStartingRef.current는 게임 종료 시에만 해제 (중복 실행 방지)

      // 게임 시작 완료
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

  // 점수 업데이트 (게임이 활성화된 상태에서만)
  useEffect(() => {
    // 게임이 활성화되지 않았거나 처리 중이면 업데이트하지 않음
    if (
      !gameStateRef.current.isGameActive ||
      gameStateRef.current.isProcessingFinish
    )
      return;

    const score = Math.round(shakeValue);
    setCurrentScoreRef.current(score);

    // 현재 점수를 실시간으로 저장 (최종 제출용)
    finalScoreRef.current = score;

    // 점수가 10의 배수로 변경될 때만 업데이트 (성능 최적화)
  }, [shakeValue]);

  return {
    room,
    magnitude,
    shakeValue,
    handleFinishRound,
    stopGame,
    reset, // 센서 리셋 함수 반환
    isSubmittingScore, // 로딩 상태 반환
  };
}
