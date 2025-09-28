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

  // 게임 상태 관리
  const gameEndAtRef = useRef<number | null>(null);
  const startLockUntilRef = useRef<number>(0);
  const isStartingRef = useRef<boolean>(false); // 시작 중 플래그
  const finalScoreRef = useRef<number>(0); // 게임 종료 시점의 최종 점수 보존
  const navigatedToResultRef = useRef<boolean>(false); // 결과화면 이동 방지

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

  // 게임 종료 처리
  const handleFinishGame = useCallback(async () => {
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

      // 먼저 점수 제출 (모든 플레이어가 점수를 제출하도록)
      if (me) {
        try {
          setIsSubmittingScore(true); // 로딩 시작
          console.log("점수 제출:", { finalScore, nickname });
          await molbbangApi.submitScore(finalScore);
          console.log("점수 제출 성공");
        } catch (error: any) {
          console.error("점수 제출 실패:", error);
        } finally {
          setIsSubmittingScore(false); // 로딩 종료
        }
      } else {
        console.warn("me 객체를 찾을 수 없어 점수를 제출할 수 없습니다");
      }

      // 게임 종료 (바로 최종 결과로)
      console.log("호스트가 게임 종료 요청");

      // 참가자들이 점수를 제출할 시간을 주기 위해 잠시 대기
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const res = await molbbangApi.finishRound();

      if (res.ok) {
        // 게임 완료 상태로 처리 (바로 최종 결과)
        // 서버 상태 반영 (room.status는 실제 DB 상태 유지)
        setRoom((prevRoom: MolbbangRoom | null) => {
          // 게임 완료 상태로 업데이트
          return prevRoom
            ? {
                ...prevRoom,
                round: 1, // 게임은 항상 1판
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
            gameEndAtRef.current = null;
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
        gameEndAtRef.current = null;
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

        // 결과 화면으로 바로 이동 (호스트가 직접 종료하는 경우)
        navigatedToResultRef.current = true; // 중복 이동 방지
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
      // 게임 종료 시 락 해제
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
    gameEndAtRef.current = null;
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

  // 폴링 (게임 중일 때는 더 빠른 주기로)
  useEffect(() => {
    if (!code) {
      return;
    }

    let interval: ReturnType<typeof setInterval>;

    const startPolling = () => {
      const pollInterval = gameStateRef.current.isGameActive
        ? 1000
        : GAME_CONSTANTS.POLLING_INTERVAL;

      interval = setInterval(async () => {
        try {
          const r = await molbbangApi.fetchRoom();
          if (isRoom(r)) {
            setRoom(r);
          }
        } catch {
          // ignore
        }
      }, pollInterval);
    };

    startPolling();

    // 게임 상태가 변경될 때마다 폴링 주기 재설정
    const gameStateInterval = setInterval(() => {
      clearInterval(interval);
      startPolling();
    }, 2000); // 2초마다 폴링 주기 재설정

    return () => {
      clearInterval(interval);
      clearInterval(gameStateInterval);
    };
  }, [code]);

  // 게임 시작 감지 (서버 기반 동기화)
  useEffect(() => {
    if (!room || room.status !== "playing") return;

    const canStartGame =
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

      // 게임 시작 시간을 현재 시각으로 설정 (동기화 개선을 위해 폴링 주기 단축)
      const gameStartTime = Date.now();
      gameEndAtRef.current = gameStartTime + GAME_CONSTANTS.GAME_MS;

      // 시작 직후 서버 상태 요동(playing/lobby 튐) 무시 구간
      startLockUntilRef.current = Date.now() + 500;

      const initialRemaining = Math.max(
        0,
        Math.ceil(((gameEndAtRef.current ?? 0) - Date.now()) / 1000)
      );
      setRemainingSecondsRef.current(initialRemaining);
      reset(); // 센서 리셋으로 점수도 자동으로 0이 됨

      // 서버 기반 게임 종료 예약 (정확한 시각 계산)
      const timeUntilEnd = gameEndAtRef.current - Date.now();
      if (timeUntilEnd > 0) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          console.log("타이머 종료: handleFinishGame 호출");
          void handleFinishGame();
        }, timeUntilEnd);
      } else {
        // 게임 시간이 이미 지났다면 즉시 종료
        console.log("게임 시간이 이미 지남: 즉시 종료");
        void handleFinishGame();
      }

      // 종료시각 기반 카운트다운
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      countdownRef.current = setInterval(() => {
        if (!gameEndAtRef.current) return;
        const remainingMs = gameEndAtRef.current - Date.now();
        const next = Math.max(0, Math.ceil(remainingMs / 1000));
        setRemainingSecondsRef.current(next);

        // 게임이 종료되었으면 타이머 정리
        if (next <= 0 && countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
      }, 100);

      gameStateRef.current.isStartingGame = false;
      // isStartingRef.current는 게임 종료 시에만 해제 (중복 실행 방지)

      console.log("게임 시작:", {
        gameStartTime,
        gameEndTime: gameEndAtRef.current,
        timeUntilEnd,
        initialRemaining,
        isHost: hostFlagFromParams,
        nickname,
      });
    }
  }, [room?.status]); // 의존성 최소화

  // 서버 상태 기반 게임 종료 감지
  useEffect(() => {
    if (!room) return;
    if (Date.now() < startLockUntilRef.current) return;

    // 1. 서버에서 게임 종료 상태로 변경된 경우
    if (
      room.status === "finished" &&
      gameStateRef.current.isGameActive &&
      !navigatedToResultRef.current
    ) {
      console.log("서버 게임 종료 감지: 결과화면으로 이동");
      navigatedToResultRef.current = true;
      stopGame();

      // 결과화면으로 이동
      const resultParams = {
        code,
        nick: nickname,
        amount: String(amount),
      };

      router.replace({
        pathname: "/molbbang/room/[code]/result",
        params: resultParams,
      });
      return;
    }

    // 2. 대기방으로 돌아온 경우 (게임 취소 또는 오류)
    if (room.status === "lobby" && gameStateRef.current.isGameActive) {
      console.log("대기방 상태로 변경: 게임 취소됨, 대기실로 이동");
      stopGame();

      // 게임이 취소되었으므로 대기실로 이동
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
  }, [room?.status, stopGame, code, nickname, amount, router]);

  // 타이머 기반 게임 종료 감지 (더 자주 체크)
  useEffect(() => {
    if (!gameStateRef.current.isGameActive || navigatedToResultRef.current) {
      return;
    }

    const checkTimer = () => {
      if (
        gameEndAtRef.current &&
        Date.now() >= gameEndAtRef.current &&
        gameStateRef.current.isGameActive &&
        !navigatedToResultRef.current
      ) {
        console.log("타이머 게임 종료 감지: 점수 제출 후 결과화면으로 이동");
        navigatedToResultRef.current = true;

        // 참가자들도 점수를 제출하도록 처리
        const handleParticipantFinish = async () => {
          try {
            // 현재 점수 제출
            const currentScore = finalScoreRef.current;
            console.log("참가자 점수 제출:", { currentScore, nickname });

            await molbbangApi.submitScore(currentScore);
            console.log("참가자 점수 제출 성공");
          } catch (error) {
            console.error("참가자 점수 제출 실패:", error);
            // 점수 제출 실패해도 결과화면으로 이동 (서버에서 0점으로 처리될 것)
          } finally {
            stopGame();

            // 점수 제출 성공/실패 관계없이 결과화면으로 이동
            const resultParams = {
              code,
              nick: nickname,
              amount: String(amount),
            };

            router.replace({
              pathname: "/molbbang/room/[code]/result",
              params: resultParams,
            });
          }
        };

        void handleParticipantFinish();
        return;
      }
    };

    // 0.5초마다 타이머 체크
    const interval = setInterval(checkTimer, 500);

    return () => clearInterval(interval);
  }, [
    gameStateRef.current.isGameActive,
    stopGame,
    code,
    nickname,
    amount,
    router,
  ]);

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
    handleFinishRound: handleFinishGame, // 함수명 변경
    stopGame,
    reset, // 센서 리셋 함수 반환
    isSubmittingScore, // 로딩 상태 반환
  };
}
