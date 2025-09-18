// src/features/Lucky/screens/MolbbangGameScreen.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert } from "react-native";
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

// 라이브 랭킹 계산(내 현재 흔들기 값을 합산해서 정렬)
function makeLiveRanking(
  members: MolbbangMember[],
  meNick: string,
  myLiveAdd: number
): Array<{ userId: string; nickname: string; total: number; isMe: boolean }> {
  return [...members]
    .map((m) => {
      const add = m.nickname === meNick ? myLiveAdd : 0;
      const total = (m.total ?? 0) + add;
      return {
        userId: m.userId,
        nickname: m.nickname,
        total,
        isMe: m.nickname === meNick,
      };
    })
    .sort((a, b) => b.total - a.total);
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

  // 폴링: 상태 동기화 + 화면 전환
  useEffect(() => {
    if (!code) return;
    const tm = setInterval(async () => {
      try {
        const r = await molbbangApi.fetchRoom(code);
        if (!isRoom(r)) return;

        setRoom(r);

        if (r.status === "finished") {
          // 최종 결과 화면으로
          router.replace({
            pathname: "/molbbang/room/[code]/result",
            params: { code, nick: nickname, amount },
          });
        } else if (r.status === "lobby") {
          // 다음 라운드 준비(로비)로
          router.replace({
            pathname: "/molbbang/room/[code]",
            params: { code, nick: nickname, amount },
          });
        }
      } catch {
        // 네트워크/목 오류 무시
      }
    }, 1000);
    return () => clearInterval(tm);
  }, [code, nickname, amount, router]);

  // 라운드 타이머: 7초 뒤 자동 종료
  useEffect(() => {
    reset();
    latestScoreRef.current = 0;
    const t = setTimeout(() => {
      void onFinishRound();
    }, 7000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, room?.round]);

  // 라운드 종료
  const onFinishRound = useCallback(async () => {
    const myScore = latestScoreRef.current;
    const me = room?.members.find((m) => m.nickname === nickname);
    const totals = me ? { [me.userId]: myScore } : undefined;

    const res = await molbbangApi.finishRound(code, { totals });
    if (!res.ok) return;

    if (res.status === "finished") {
      Alert.alert("게임 종료", "모든 라운드가 끝났어요! 결과를 확인해봐요.");
      // 폴링이 result로 이동시킴(안전망으로 즉시 이동해도 됨)
      router.replace({
        pathname: "/molbbang/room/[code]/result",
        params: { code, nick: nickname, amount },
      });
    } else {
      Alert.alert("라운드 종료", "다음 라운드를 준비해 주세요.");
      // 폴링이 로비로 이동시킴(안전망으로 즉시 이동)
      router.replace({
        pathname: "/molbbang/room/[code]",
        params: { code, nick: nickname, amount },
      });
    }
  }, [code, nickname, amount, room?.members, router]);

  // 라이브 랭킹(내 현재 흔들기 포함)
  const liveRanking = useMemo(() => {
    return room
      ? makeLiveRanking(room.members, nickname, Math.round(shakeValue))
      : [];
  }, [room, nickname, shakeValue]);

  return (
    <GameTemplate
      code={code}
      amount={amount}
      round={room?.round ?? 1}
      magnitude={magnitude}
      myScore={shakeValue}
      idleImage={idlePng}
      shakeImage={shakePng}
      onFinishRound={onFinishRound}
      liveRanking={liveRanking} // ← GameTemplate에 표시
    />
  );
}
