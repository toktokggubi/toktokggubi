import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  molbbangApi,
  type MolbbangRoom,
  type MolbbangMember,
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

export default function MolbbangGameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string | string[];
    nick?: string | string[];
    amount?: string | string[];
  }>();

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

  // 흔들기 센서(게임 중엔 항상 on)
  const { magnitude, shakeValue, reset } = useShake({
    sampleHz: 60,
    smoothing: 0.2,
    shakeThreshold: 1.2,
    enabled: true,
  });

  // 최신 점수 ref
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
            params: { code, nick: nickname, amount },
          });
        } else if (r.status === "lobby") {
          router.replace({
            pathname: "/molbbang/room/[code]",
            params: { code, nick: nickname, amount },
          });
        }
      } catch {
        // ignore
      }
    }, 900);
    return () => clearInterval(tm);
  }, [code, nickname, amount, router, rankModalVisible]);

  // 라운드 타이머: 5초 뒤 자동 종료
  useEffect(() => {
    if (!code) return;
    if (rankModalVisible) return; // 🔒 모달 떠있으면 타이머 정지

    reset();
    latestScoreRef.current = 0;

    const t = setTimeout(() => {
      void onFinishRound();
    }, 5000);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, room?.round, rankModalVisible]);

  // 라운드 종료: 점수 반영 → 결과 받아와 모달 띄우기
  const isFinishingRef = useRef<boolean>(false);

  const onFinishRound = useCallback(async () => {
    // 🔒 모달 떠있거나 이미 처리 중이면 바로 종료
    if (rankModalVisible) return;
    if (isFinishingRef.current) return;
    isFinishingRef.current = true;

    try {
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
  // ⬇️ onFinishRound 밑에 추가
  const onNextRound = useCallback(() => {
    // 모달 닫고 로비(다음 라운드 준비)로
    setRankModalVisible(false);
    router.replace({
      pathname: "/molbbang/room/[code]",
      params: { code, nick: nickname, amount },
    });
  }, [router, code, nickname, amount]);

  const onViewFinal = useCallback(() => {
    // 모달 닫고 최종 결과 화면으로
    setRankModalVisible(false);
    router.replace({
      pathname: "/molbbang/room/[code]/result",
      params: { code, nick: nickname, amount },
    });
  }, [router, code, nickname, amount]);

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
    />
  );
}
