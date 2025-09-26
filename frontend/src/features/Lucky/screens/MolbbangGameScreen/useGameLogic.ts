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
  setRankModalVisible,
  setRankModalData,
  setIsFinalRound,
  currentScore,
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
  const finalScoreRef = useRef<number>(0); // 게임 종료 시점의 최종 점수 보존

  // ref 업데이트
  setRemainingSecondsRef.current = setRemainingSeconds;
  setCurrentScoreRef.current = setCurrentScore;
  setRankModalVisibleRef.current = setRankModalVisible;
  setRankModalDataRef.current = setRankModalData;
  setIsFinalRoundRef.current = setIsFinalRound;

  // 흔들기 센서 (항상 활성화, 게임 종료 시점에만 수동으로 리셋)
  const { magnitude, shakeValue, reset } = useShake({
    sampleHz: 60,
    smoothing: 0.2,
    shakeThreshold: 0.01, // ← 1.0에서 0.01로 낮춤
    enabled: true, // ← 항상 활성화
  });

  // 라운드 종료 처리
  const handleFinishRound = useCallback(async () => {
    if (
      gameStateRef.current.isProcessingFinish ||
      gameStateRef.current.hasShownModal ||
      !gameStateRef.current.isGameActive
    ) {
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
      // 서버에서 받은 실제 닉네임으로 me 객체 찾기 (URL 파라미터 무시)
      let me = null;
      if (room?.members && room.members.length > 0) {
        // 임시로 첫 번째 멤버를 사용 (실제로는 사용자 인증 정보로 찾아야 함)
        me = room.members[0];
        console.log("🔍 [게임 종료] 서버 닉네임 사용:", me?.nickname);
      }

      // 게임 종료 시점의 최종 점수 보존
      // shakeValue가 리셋되기 전에 현재 점수를 보존
      const currentScoreValue = Math.round(shakeValue);
      finalScoreRef.current = currentScoreValue;
      const finalScore = finalScoreRef.current;

      // 점수 보존 후 즉시 센서 리셋 (점수 누적 방지)
      reset();

      // 먼저 점수 제출
      if (me) {
        try {
          await molbbangApi.submitScore(finalScore);
        } catch (error: any) {
          console.error("🔍 [점수 제출] 실패:", error);
        }
      } else {
        console.error("🔍 [점수 제출] me 객체 없음 - 점수 제출 불가");
      }

      // 라운드 종료
      console.log("🔍 [endRound API] 요청 시작");
      const res = await molbbangApi.finishRound();
      console.log("🔍 [endRound API] 응답 받음:", {
        ok: res.ok,
        status: res.status,
        round: res.round,
        fullResponse: res,
      });

      if (res.ok) {
        // 라운드 완료 상태는 대기방에서만 관리됨
        if (res.status === "lobby") {
          console.log(
            "🔍 [endRound API] 중간 라운드 완료 - 다음 라운드 대기 상태"
          );
        } else if (res.status === "finished") {
          console.log("🔍 [endRound API] 모든 라운드 완료 - 게임 종료");
        }

        // 서버 상태 반영 (room.status는 실제 DB 상태 유지)
        setRoom((prevRoom: MolbbangRoom | null) => {
          // 라운드 종료 API에서 반환하는 round는 현재 라운드 번호
          const currentRound = res.round || prevRoom?.round || 1;

          console.log("🔍 [endRound API] room 상태 업데이트:", {
            prevStatus: prevRoom?.status,
            prevRound: prevRoom?.round,
            resStatus: res.status,
            resRound: res.round,
            currentRound,
            roundCompletionStatus: res.status,
          });

          return prevRoom
            ? {
                ...prevRoom,
                round: currentRound, // 현재 라운드 번호 유지
                // room.status는 변경하지 않음 (실제 DB 상태 유지)
              }
            : null;
        });

        // 서버에서 실제 결과 가져오기 (모든 라운드가 완료된 상태일 때만)
        // getResults API는 방 상태가 "finished"일 때만 작동 (모든 라운드 완료 후)
        if (res.status === "finished") {
          try {
            const resultsRes = await molbbangApi.getResults();
            if (resultsRes.ok) {
              // 서버에서 받은 실제 랭킹 데이터 사용
              const rankingData = resultsRes.ranking.map((row) => ({
                userId: row.userId,
                nickname: row.nickname,
                total: row.total,
              }));

              // 모달 표시
              setRankModalDataRef.current(rankingData);
              setIsFinalRoundRef.current(res.status === "finished");
              setRankModalVisibleRef.current(true);

              console.log(
                "🔍 [모달 표시] 서버 결과 사용 (FINISHED):",
                rankingData
              );
              return; // 성공 시 함수 종료
            } else {
              throw new Error("결과 조회 실패");
            }
          } catch (error: any) {
            console.error("🔍 [결과 조회] 실패 - 상세 분석:", {
              error: error,
              errorMessage: error.message,
              errorCode: error.code,
              statusCode: error.statusCode,
              isMolbbangError: error.name === "MolbbangError",
              originalError: error,
            });
            // 에러 발생 시 폴백으로 진행
          }
        } else {
          // 중간 라운드 완료 - 로컬 데이터 사용
        }

        // 폴백: 로컬 데이터 사용 (방이 FINISHED가 아니거나 서버 조회 실패 시)
        // 게임 화면에서 표시된 점수와 동일하게 모달에 표시
        const rankingData = [
          {
            userId: me?.userId || "current_user",
            nickname: me?.nickname || nickname || "플레이어",
            total: finalScore, // ← 게임 종료 시점의 최종 점수 사용
          },
        ];

        // 모달 표시 전에 점수 검증
        if (finalScore >= 0) {
          setRankModalDataRef.current(rankingData);
          setIsFinalRoundRef.current(res.status === "finished");
          setRankModalVisibleRef.current(true);
          console.log("🔍 [결과 조회] 로컬 데이터 사용:", rankingData);
        } else {
          console.error("🔍 [모달 점수] 유효하지 않은 점수:", finalScore);
          // 점수가 유효하지 않으면 기본값 사용
          const fallbackData = [
            {
              userId: me?.userId || "current_user",
              nickname: me?.nickname || nickname || "플레이어",
              total: 0,
            },
          ];
          setRankModalDataRef.current(fallbackData);
          setIsFinalRoundRef.current(res.status === "finished");
          setRankModalVisibleRef.current(true);
        }

        // endRound API 응답에 따라 대기방으로 이동 (라운드 완료 상태 전달)
        console.log("🔍 [대기방 이동] endRound 응답 기반:", res.status);
        router.replace({
          pathname: "/molbbang/room/[code]",
          params: {
            code,
            nick: nickname,
            amount,
            host: hostFlagFromParams ? "1" : "0",
            roundStatus: res.status, // "lobby" 또는 "finished"
          },
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
      // 게임 종료 시 락 해제 (다음 라운드 준비를 위해)
      isStartingRef.current = false;
      console.log("🔍 [라운드 종료] 락 해제 - 다음 라운드 준비 가능");
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
    console.log("🔍 [게임 종료] 상태 완전 초기화", {
      isStartingRef: isStartingRef.current,
      startedRound: startedRoundRef.current,
      gameState: gameStateRef.current,
      finalScore: finalScoreRef.current,
    });
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
      !gameStateRef.current.hasShownModal &&
      !gameStateRef.current.isProcessingFinish &&
      !gameStateRef.current.isTimerRunning &&
      !gameStateRef.current.isStartingGame &&
      !isStartingRef.current;

    if (canStartGame) {
      console.log("🔍 [게임 시작] 감지 - startGame() 호출", {
        currentRound,
        startedRound: startedRoundRef.current,
        gameState: gameStateRef.current,
      });

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

      console.log("🔍 [게임 시작] 상태 설정 완료", {
        round: startedRoundRef.current,
        endAt: roundEndAtRef.current,
        lockUntil: startLockUntilRef.current,
      });

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
      // isStartingRef.current는 게임 종료 시에만 해제 (중복 실행 방지)

      console.log("🔍 [게임 시작] 완료 - 상태 초기화", {
        round: startedRoundRef.current,
        gameState: gameStateRef.current,
        isStartingRef: isStartingRef.current,
      });
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
    if (!gameStateRef.current.isGameActive) return;

    const score = Math.round(shakeValue);
    setCurrentScoreRef.current(score);

    // 점수가 10의 배수로 변경될 때만 로그 출력 (성능 최적화)
    if (score % 10 === 0 || score === 0) {
      console.log("🔍 [점수 업데이트] currentScore 업데이트:", {
        shakeValue: shakeValue,
        currentScore: score,
        magnitude: magnitude,
        isGameActive: gameStateRef.current.isGameActive,
      });
    }
  }, [shakeValue]);

  return {
    room,
    magnitude,
    shakeValue,
    handleFinishRound,
    stopGame,
    reset, // 센서 리셋 함수 반환
  };
}
