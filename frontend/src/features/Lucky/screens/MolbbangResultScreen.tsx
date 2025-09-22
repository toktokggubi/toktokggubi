import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { molbbangApi } from "@/features/Lucky/api/molbbangService";
import type { MolbbangRoom } from "@/features/Lucky/api/molbbangService";
import ResultTemplate from "@/features/Lucky/templates/Molbbang/ResultTemplate";

function isRoom(v: unknown): v is MolbbangRoom {
  return (
    typeof v === "object" && v !== null && Array.isArray((v as any).members)
  );
}

export default function MolbbangResultScreen() {
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
  const [ranking, setRanking] = useState<
    { userId: string; nickname: string; total: number }[]
  >([]);
  const [jackpotUserId, setJackpotUserId] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      const r = await molbbangApi.fetchRoom(code);
      if (!mounted) return;
      if (isRoom(r)) setRoom(r);
      const res = await molbbangApi.getResults(code);
      if (mounted && res.ok) {
        setRanking(res.ranking);
        setJackpotUserId(res.jackpotUserId);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [code]);

  const myRank = useMemo(() => {
    const idx = ranking.findIndex((x) => x.nickname === nickname);
    return idx >= 0 ? idx + 1 : null;
  }, [ranking, nickname]);

  const jackpotNick = useMemo(() => {
    const hit = ranking.find((r) => r.userId === jackpotUserId);
    return hit?.nickname;
  }, [ranking, jackpotUserId]);
  // ✅ 내가 꼴등인지 판단 (jackpot 닉네임과 동일 = 꼴등 규칙)
  const isLoser =
    jackpotNick === nickname || (myRank !== null && myRank === ranking.length);
  const onBackToLobby = () => {
    router.replace({
      pathname: "/molbbang/room/[code]",
      params: { code, nick: nickname, amount },
    });
  };
  const onPay = () => {
    router.push({
      pathname: "/pay/payment",
      params: { code, nick: nickname, amount },
    });
  };
  const onExit = () => {
    router.replace("/molbbang"); // ✅ 원하는 경로로 이동 (예: 홈 화면)
  };

  return (
    <ResultTemplate
      code={code}
      amount={amount}
      ranking={ranking}
      myNickname={nickname}
      myRank={myRank}
      jackpotNickname={jackpotNick}
      onBackToLobby={onBackToLobby}
      onExit={onExit}
      isLoser={isLoser} // ✅ 전달
      onPay={onPay}
    />
  );
}
