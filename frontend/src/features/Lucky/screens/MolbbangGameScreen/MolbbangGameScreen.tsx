// src/features/Lucky/screens/MolbbangGameScreen/MolbbangGameScreen.tsx
import React from "react";
import { useLocalSearchParams } from "expo-router";
import GameTemplate from "@/features/Lucky/templates/Molbbang/GameTemplate";
import { parseGameParams, GAME_CONSTANTS } from "./utils";
import { useGameState } from "./useGameState";
import { useGameLogic } from "./useGameLogic";
import { useModalHandlers } from "./useModalHandlers";

const idlePng = require("@/assets/images/character/big-character-02.png");
const shakePng = require("@/assets/images/character/big-character-05.png");

export default function MolbbangGameScreen() {
  const params = useLocalSearchParams<{
    code?: string | string[];
    nick?: string | string[];
    amount?: string | string[];
    host?: string | string[];
  }>();

  // 파라미터 파싱
  const { code, nickname, amount, hostFlagFromParams } =
    parseGameParams(params);

  // 게임 상태 관리
  const {
    remainingSeconds,
    setRemainingSeconds,
    currentScore,
    setCurrentScore,
    rankModalVisible,
    setRankModalVisible,
    rankModalData,
    setRankModalData,
    isFinalRound,
    setIsFinalRound,
    timerRef,
    countdownRef,
    gameStateRef,
  } = useGameState();

  // 게임 로직
  const { room, magnitude, handleFinishRound, stopGame, reset } = useGameLogic({
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
    currentScore, // 현재 점수 상태 전달
  });

  // 모달 핸들러
  const { onNextRound, onViewFinal } = useModalHandlers({
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
    resetSensor: reset, // 센서 리셋 함수 전달
  });

  return (
    <GameTemplate
      code={code}
      amount={amount}
      round={room?.round ?? 1}
      remainingSeconds={remainingSeconds}
      magnitude={magnitude}
      myScore={currentScore}
      idleImage={idlePng}
      shakeImage={shakePng}
      onFinishRound={handleFinishRound}
      // 모달 관련
      rankModalVisible={rankModalVisible}
      rankModalData={rankModalData}
      isFinalRound={isFinalRound}
      onNextRound={onNextRound}
      onViewFinal={onViewFinal}
    />
  );
}
