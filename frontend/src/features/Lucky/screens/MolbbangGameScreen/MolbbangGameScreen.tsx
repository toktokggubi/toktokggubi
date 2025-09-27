// src/features/Lucky/screens/MolbbangGameScreen/MolbbangGameScreen.tsx
import React from "react";
import { useLocalSearchParams } from "expo-router";
import GameTemplate from "@/features/Lucky/templates/Molbbang/GameTemplate";
import { parseGameParams, GAME_CONSTANTS } from "./utils";
import { useGameState } from "./useGameState";
import { useGameLogic } from "./useGameLogic";

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
    currentScore, // 현재 점수 상태 전달
  });

  // 모달 핸들러는 더 이상 필요하지 않음 (바로 결과 화면으로 이동)

  return (
    <GameTemplate
      code={code}
      amount={amount}
      round={1} // 라운드는 항상 1
      remainingSeconds={remainingSeconds}
      magnitude={magnitude}
      myScore={currentScore}
      idleImage={idlePng}
      shakeImage={shakePng}
      onFinishRound={handleFinishRound}
    />
  );
}
