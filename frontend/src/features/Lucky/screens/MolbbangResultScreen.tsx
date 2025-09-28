import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { molbbangApi } from "@/features/Lucky/api/molbbangService";
import type { MolbbangRoom } from "@/features/Lucky/api/molbbangService";

// 전역 변수 타입 선언
declare global {
  interface Window {
    __resultParamsLogged?: boolean;
  }
}
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
      : "";
  const amount = Number(
    typeof params.amount === "string"
      ? params.amount
      : Array.isArray(params.amount)
      ? params.amount[0]
      : 0
  );

  // URL 파라미터 처리

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
      try {
        // 게임이 이미 종료되었으므로 바로 결과 조회
        const res = await molbbangApi.getResults();

        if (mounted && res.ok) {
          // 랭킹 데이터가 비어있거나 유효하지 않은 경우 처리
          if (
            res.ranking &&
            Array.isArray(res.ranking) &&
            res.ranking.length > 0
          ) {
            setRanking(res.ranking);
            setJackpotUserId(res.jackpotUserId);
          } else {
            setRanking([]);
          }
        } else {
          setRanking([]);
        }
      } catch (error) {
        // 에러 발생 시 빈 랭킹으로 설정
        if (mounted) {
          setRanking([]);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [code]);

  const myRank = useMemo(() => {
    // 닉네임으로 사용자 순위 찾기
    const idx = ranking.findIndex((r) => r.nickname === nickname);
    return idx >= 0 ? idx + 1 : null;
  }, [ranking, nickname]);

  const jackpotNick = useMemo(() => {
    const hit = ranking.find((r) => r.userId === jackpotUserId);
    return hit?.nickname;
  }, [ranking, jackpotUserId]);
  // ✅ 내가 꼴등인지 판단 (jackpot 닉네임과 동일 = 꼴등 규칙)
  const isLoser = useMemo(() => {
    // 1. jackpotNick과 일치하는 경우
    if (jackpotNick === nickname) {
      return true;
    }

    // 2. 랭킹에서 꼴등인 경우 (마지막 순위)
    if (myRank !== null && myRank === ranking.length && ranking.length > 0) {
      return true;
    }

    // 3. 랭킹이 비어있지 않고 내가 가장 낮은 점수를 가진 경우
    if (ranking.length > 0 && myRank !== null) {
      const myRanking = ranking.find((r) => r.nickname === nickname);
      const lowestScore = Math.min(...ranking.map((r) => r.total));
      if (myRanking && myRanking.total === lowestScore) {
        return true;
      }
    }

    return false;
  }, [jackpotNick, nickname, myRank, ranking]);

  // 디버깅을 위한 로그
  console.log("결제 버튼 표시 조건 확인:", {
    nickname,
    jackpotNick,
    myRank,
    rankingLength: ranking.length,
    isLoser,
    ranking: ranking.map((r) => ({ nickname: r.nickname, total: r.total })),
    myRanking: ranking.find((r) => r.nickname === nickname),
  });
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

  // 랭킹 데이터 로딩 상태 확인

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
