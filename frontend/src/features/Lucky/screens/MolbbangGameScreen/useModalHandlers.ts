// src/features/Lucky/screens/MolbbangGameScreen/useModalHandlers.ts
import { useCallback } from "react";
import { useRouter } from "expo-router";
import type { GameState } from "./useGameState";

interface UseModalHandlersProps {
  code: string;
  nickname: string;
  amount: number;
  hostFlagFromParams: boolean;
  room: any;
  currentScore: number;
  gameStateRef: React.MutableRefObject<GameState>;
  setRankModalVisible: (visible: boolean) => void;
  setRankModalData: (data: any[]) => void;
  setIsFinalRound: (isFinal: boolean) => void;
  stopGame: () => void;
}

export function useModalHandlers({
  code,
  nickname,
  amount,
  hostFlagFromParams,
  room,
  currentScore,
  gameStateRef,
  setRankModalVisible,
  setRankModalData,
  setIsFinalRound,
  stopGame,
}: UseModalHandlersProps) {
  const router = useRouter();

  const onNextRound = useCallback(() => {
    console.log("🔍 [다음라운드준비] 버튼 클릭");

    // 모달 닫기
    setRankModalVisible(false);
    setRankModalData([]);
    setIsFinalRound(false);

    // 게임 상태 완전 리셋
    gameStateRef.current.hasShownModal = false;
    gameStateRef.current.isGameActive = false;
    gameStateRef.current.isTimerRunning = false;
    gameStateRef.current.isProcessingFinish = false;
    gameStateRef.current.isStartingGame = false;

    // 게임 종료
    stopGame();

    // 대기방으로 이동
    router.replace({
      pathname: "/molbbang/room/[code]",
      params: {
        code,
        nick: nickname,
        amount,
        host: hostFlagFromParams ? "1" : "0",
      },
    });
  }, [
    room?.round,
    room?.status,
    currentScore,
    stopGame,
    code,
    nickname,
    hostFlagFromParams,
    router,
    amount,
    setRankModalVisible,
    setRankModalData,
    setIsFinalRound,
    gameStateRef,
  ]);

  const onViewFinal = useCallback(() => {
    console.log("🔍 [최종결과보기] 버튼 클릭");

    // 모달 닫기
    setRankModalVisible(false);
    setRankModalData([]);
    setIsFinalRound(false);

    // 게임 상태 완전 리셋
    gameStateRef.current.hasShownModal = false;
    gameStateRef.current.isGameActive = false;
    gameStateRef.current.isTimerRunning = false;
    gameStateRef.current.isProcessingFinish = false;
    gameStateRef.current.isStartingGame = false;

    // 게임 종료
    stopGame();

    // 결과 화면으로 이동
    router.replace({
      pathname: "/molbbang/room/[code]/result",
      params: {
        code,
        nick: nickname,
        amount,
        host: hostFlagFromParams ? "1" : "0",
      },
    });
  }, [
    stopGame,
    code,
    nickname,
    hostFlagFromParams,
    router,
    amount,
    setRankModalVisible,
    setRankModalData,
    setIsFinalRound,
    gameStateRef,
  ]);

  return {
    onNextRound,
    onViewFinal,
  };
}
