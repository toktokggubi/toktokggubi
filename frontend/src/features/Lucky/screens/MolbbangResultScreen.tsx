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
        console.log("🔍 [결과 페이지] API 호출 시작, code:", code);

        // 게임이 이미 종료되었으므로 바로 결과 조회
        console.log("🔍 [결과 페이지] getResults 호출 시작");
        const res = await molbbangApi.getResults();
        console.log("🔍 [결과 페이지] getResults 응답:", res);
        console.log("🔍 [결과 페이지] getResults 응답 타입:", typeof res);
        console.log("🔍 [결과 페이지] getResults ok:", res.ok);
        console.log("🔍 [결과 페이지] getResults ranking:", res.ranking);

        if (mounted && res.ok) {
          console.log("🔍 [결과 페이지] 랭킹 데이터 설정:", res.ranking);

          // 랭킹 데이터가 비어있거나 유효하지 않은 경우 처리
          if (
            res.ranking &&
            Array.isArray(res.ranking) &&
            res.ranking.length > 0
          ) {
            setRanking(res.ranking);
            setJackpotUserId(res.jackpotUserId);
          } else {
            console.warn(
              "⚠️ [결과 페이지] 랭킹 데이터가 비어있음, 빈 배열로 설정"
            );
            setRanking([]);
          }
        } else {
          console.error("❌ [결과 페이지] getResults 실패:", res);
          console.error(
            "❌ [결과 페이지] 응답 상세:",
            JSON.stringify(res, null, 2)
          );

          // 실패 시에도 빈 랭킹으로 설정하여 UI가 깨지지 않도록 함
          setRanking([]);
        }
      } catch (error) {
        console.error("❌ [결과 페이지] API 호출 오류:", error);
        console.error("❌ [결과 페이지] 에러 상세:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });

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

  // 랭킹 데이터 로딩 상태 확인
  console.log("🔍 [결과 페이지] 현재 랭킹 데이터:", ranking);
  console.log("🔍 [결과 페이지] 내 순위:", myRank);
  console.log("🔍 [결과 페이지] 잭팟 닉네임:", jackpotNick);

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
