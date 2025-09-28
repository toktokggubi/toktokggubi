import type { MolbbangRoom } from "@/features/Lucky/api/molbbangService";
import { molbbangApi } from "@/features/Lucky/api/molbbangService";
import ResultTemplate from "@/features/Lucky/templates/Molbbang/ResultTemplate";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    __resultParamsLogged?: boolean;
  }
}

function isRoom(v: unknown): v is MolbbangRoom {
  return typeof v === "object" && v !== null && Array.isArray((v as any).members);
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

  // 1) 파라미터의 amount는 "초기값"으로만 사용하고, 최종 값은 getResults().amount로 덮어쓴다.
  const initialAmount = Number(
    typeof params.amount === "string"
      ? params.amount
      : Array.isArray(params.amount)
      ? params.amount[0]
      : 0
  );
  const [amount, setAmount] = useState<number>(Number.isFinite(initialAmount) ? initialAmount : 0);

  const [ranking, setRanking] = useState<
    { userId: string; nickname: string; total: number }[]
  >([]);
  const [jackpotUserId, setJackpotUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // 2) 결과 조회 시 서버에서 내려주는 금액을 사용한다.
        const res = await molbbangApi.getResults();

        if (!mounted) return;

        if (res.ok) {
          if (Array.isArray(res.ranking)) {
            setRanking(res.ranking);
          } else {
            setRanking([]);
          }

          setJackpotUserId(res.jackpotUserId);

          // 서버 응답 금액이 유효하면 그걸로 갱신
          if (typeof res.amount === "number" && Number.isFinite(res.amount) && res.amount > 0) {
            setAmount(res.amount);
          } else {
            // 혹시 응답에 금액이 없는 경우엔 방 정보로 보정 시도 (선택)
            try {
              const roomView = await molbbangApi.fetchRoom();
              if (roomView?.amount && Number.isFinite(roomView.amount)) {
                setAmount(roomView.amount);
              }
            } catch {
              // ignore
            }
          }
        } else {
          setRanking([]);
        }
      } catch {
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
    const idx = ranking.findIndex((r) => r.nickname === nickname);
    return idx >= 0 ? idx + 1 : null;
  }, [ranking, nickname]);

  const jackpotNick = useMemo(() => {
    const hit = ranking.find((r) => r.userId === jackpotUserId);
    return hit?.nickname;
  }, [ranking, jackpotUserId]);

  const isLoser = useMemo(() => {
    if (jackpotNick === nickname) return true;
    if (myRank !== null && myRank === ranking.length && ranking.length > 0) return true;
    if (ranking.length > 0 && myRank !== null) {
      const me = ranking.find((r) => r.nickname === nickname);
      const lowest = Math.min(...ranking.map((r) => r.total));
      if (me && me.total === lowest) return true;
    }
    return false;
  }, [jackpotNick, nickname, myRank, ranking]);

  const onBackToLobby = () => {
    router.replace({
      pathname: "/molbbang/room/[code]",
      params: { code, nick: nickname, amount: String(amount) },
    });
  };
  const onPay = () => {
    router.push({
      pathname: "/pay/payment",
      params: { code, nick: nickname, amount: String(amount) },
    });
  };
  const onExit = () => {
    router.replace("/molbbang");
  };

  return (
    <ResultTemplate
      code={code}
      amount={amount} // ✅ 서버 응답으로 갱신된 금액 사용
      ranking={ranking}
      myNickname={nickname}
      myRank={myRank}
      jackpotNickname={jackpotNick}
      onBackToLobby={onBackToLobby}
      onExit={onExit}
      isLoser={isLoser}
      onPay={onPay}
    />
  );
}
