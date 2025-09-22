// src/features/Lucky/screens/MolbbangGameScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  molbbangApi,
  type MolbbangRoom,
} from "@/features/Lucky/api/molbbangService";
import { useShake } from "@/features/Lucky/model/molbbang/useShake";
import GameTemplate from "@/features/Lucky/templates/Molbbang/GameTemplate";

const idlePng = require("@/assets/images/character/big-character-02.png");
const shakePng = require("@/assets/images/character/big-character-05.png");

// 타입 가드
function isRoom(v: unknown): v is MolbbangRoom {
  return (
    typeof v === "object" &&
    v !== null &&
    Array.isArray((v as { members?: unknown }).members) &&
    typeof (v as { status?: unknown }).status === "string"
  );
}

// 타이머 핸들러 안전 타입
type TimeoutHandle = ReturnType<typeof setTimeout>;
type IntervalHandle = ReturnType<typeof setInterval>;

export default function MolbbangGameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string | string[];
    nick?: string | string[];
    amount?: string | string[];
    host?: string | string[];
  }>();

  const hostFlagFromParams =
    typeof params.host === "string"
      ? params.host === "1" || params.host === "true"
      : Array.isArray(params.host)
      ? params.host[0] === "1" || params.host[0] === "true"
      : false;

  const code =
    typeof params.code === "string"
      ? params.code
      : Array.isArray(params.code)
      ? params.code[0]
      : "";
  const nickname =
    typeof params.nick === "string"
      ? params.nick
      : Array.isArray(params.nick)
      ? params.nick[0]
      : "나";
  const amount = Number(
    typeof params.amount === "string"
      ? params.amount
      : Array.isArray(params.amount)
      ? params.amount[0]
      : 0
  );

  const [room, setRoom] = useState<MolbbangRoom | null>(null);

  // 🔹 모달 제어 상태
  const [rankModalVisible, setRankModalVisible] = useState(false);
  const [rankModalData, setRankModalData] = useState<
    { userId: string; nickname: string; total: number }[]
  >([]);
  const [isFinalRound, setIsFinalRound] = useState(false);

  // ── 남은 시간 표시용
  const ROUND_MS = 5000; // 라운드 길이(밀리초). 필요하면 조정.
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    Math.ceil(ROUND_MS / 1000)
  );
  const endTimerRef = useRef<TimeoutHandle | null>(null);
  const tickRef = useRef<IntervalHandle | null>(null);

  // 흔들기 센서(게임 중엔 항상 on)
  const { magnitude, shakeValue, reset } = useShake({
    sampleHz: 60,
    smoothing: 0.2,
    shakeThreshold: 1.2,
    enabled: true,
  });

  // 최신 점수 ref (라운드 종료 시 읽기)
  const latestScoreRef = useRef<number>(0);
  useEffect(() => {
    latestScoreRef.current = Math.round(shakeValue);
  }, [shakeValue]);

  // 폴링: 상태 동기화 + 화면 전환 (모달이 켜져 있을 땐 라우팅 보류)
  useEffect(() => {
    if (!code) return;
    const tm = setInterval(async () => {
      try {
        const r = await molbbangApi.fetchRoom(code);
        if (!isRoom(r)) return;
        setRoom(r);

        if (rankModalVisible) return; // 모달 동안 자동 라우팅 금지

        if (r.status === "finished") {
          router.replace({
            pathname: "/molbbang/room/[code]/result",
            params: {
              code,
              nick: nickname,
              amount,
              host: hostFlagFromParams ? "1" : "0",
            },
          });
        } else if (r.status === "lobby") {
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
      } catch {
        // ignore
      }
    }, 900);
    return () => clearInterval(tm);
  }, [code, nickname, amount, router, rankModalVisible, hostFlagFromParams]);

  // 라운드 타이머: ROUND_MS 뒤 자동 종료 + 남은 초(우하단 배지)
  useEffect(() => {
    if (!code) return;
    if (rankModalVisible) return; // 🔒 모달 떠있으면 타이머 정지

    // 점수/센서 초기화
    reset();
    latestScoreRef.current = 0;

    // 남은 시간 초기화
    setRemainingSeconds(Math.ceil(ROUND_MS / 1000));

    // 초단위 tick
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    // 라운드 종료 타이머
    if (endTimerRef.current) clearTimeout(endTimerRef.current);
    endTimerRef.current = setTimeout(() => {
      void onFinishRound();
    }, ROUND_MS);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (endTimerRef.current) clearTimeout(endTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, room?.round, rankModalVisible]);

  // 라운드 종료: 점수 반영 → 결과 받아와 모달 띄우기
  const isFinishingRef = useRef<boolean>(false);
  const onFinishRound = useCallback(async () => {
    if (rankModalVisible) return; // 모달 상태면 무시
    if (isFinishingRef.current) return;
    isFinishingRef.current = true;

    try {
      // 타이머 정리(중복 종료 방지)
      if (tickRef.current) clearInterval(tickRef.current);
      if (endTimerRef.current) clearTimeout(endTimerRef.current);

      const myScore = latestScoreRef.current;
      const me = room?.members.find((m) => m.nickname === nickname);
      const totals = me ? { [me.userId]: myScore } : undefined;

      const res = await molbbangApi.finishRound(code, { totals });
      if (!res.ok) return;

      const results = await molbbangApi.getResults(code);
      setRankModalData(results.ok ? results.ranking : []);
      setIsFinalRound(res.status === "finished");
      setRankModalVisible(true);
    } finally {
      isFinishingRef.current = false;
    }
  }, [code, nickname, room?.members, rankModalVisible]);

  const onNextRound = useCallback(() => {
    setRankModalVisible(false);
    router.replace({
      pathname: "/molbbang/room/[code]",
      params: {
        code,
        nick: nickname,
        amount,
        host: hostFlagFromParams ? "1" : "0",
      },
    });
  }, [router, code, nickname, amount, hostFlagFromParams]);

  const onViewFinal = useCallback(() => {
    setRankModalVisible(false);
    router.replace({
      pathname: "/molbbang/room/[code]/result",
      params: {
        code,
        nick: nickname,
        amount,
        host: hostFlagFromParams ? "1" : "0",
      },
    });
  }, [router, code, nickname, amount, hostFlagFromParams]);

  return (
    <GameTemplate
      // 기본 게임 뷰
      code={code}
      amount={amount}
      round={room?.round ?? 1}
      magnitude={magnitude}
      myScore={shakeValue}
      idleImage={idlePng}
      shakeImage={shakePng}
      onFinishRound={onFinishRound}
      // 모달 관련
      rankModalVisible={rankModalVisible}
      rankModalData={rankModalData}
      isFinalRound={isFinalRound}
      onNextRound={onNextRound}
      onViewFinal={onViewFinal}
      // 우하단 타이머
      remainingSeconds={remainingSeconds}
    />
  );
}
