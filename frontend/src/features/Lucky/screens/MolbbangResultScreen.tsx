import type { MolbbangRoom } from "@/features/Lucky/api/molbbangService";
import { molbbangApi } from "@/features/Lucky/api/molbbangService";
import ResultTemplate from "@/features/Lucky/templates/Molbbang/ResultTemplate";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window {
    __resultParamsLogged?: boolean;
  }
}

const LOSER_BY_MAX = false;

function isRoom(v: unknown): v is MolbbangRoom {
  return (
    typeof v === "object" && v !== null && Array.isArray((v as any).members)
  );
}

// 닉네임 정규화 유틸 (공백 정리, 제로폭 제거, 소문자)
const norm = (s: string) =>
  (s ?? "")
    .normalize?.("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .toLowerCase();

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

  const nicknameRaw =
    typeof params.nick === "string"
      ? params.nick
      : Array.isArray(params.nick)
      ? params.nick[0]
      : "";
  const nickname = useMemo(() => norm(nicknameRaw), [nicknameRaw]);

  // 1) 파라미터 amount는 초기값으로만 사용하고, 최종은 getResults().amount로 덮어씀
  const initialAmount = Number(
    typeof params.amount === "string"
      ? params.amount
      : Array.isArray(params.amount)
      ? params.amount[0]
      : 0
  );
  const [amount, setAmount] = useState<number>(
    Number.isFinite(initialAmount) ? initialAmount : 0
  );

  const [ranking, setRanking] = useState<
    { userId: string; nickname: string; total: number }[]
  >([]);
  const [jackpotUserId, setJackpotUserId] = useState<string | undefined>(
    undefined
  );

  // ✅ 방에서 내 userId 한 번 확보(닉네임 매칭 보조)
  const [myUserId, setMyUserId] = useState<string | null>(null);

  // 결과 늦게 도착 대비 폴링(가벼운 재시도)
  const retriesRef = useRef(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 2) 결과 조회 + 금액 동기화
  useEffect(() => {
    let mounted = true;

    const fetchOnce = async () => {
      try {
        const res = await molbbangApi.getResults();
        if (!mounted) return;

        if (res?.ok) {
          if (Array.isArray(res.ranking)) {
            setRanking(res.ranking);
          } else {
            setRanking([]);
          }
          setJackpotUserId(res.jackpotUserId);

          if (
            typeof res.amount === "number" &&
            Number.isFinite(res.amount) &&
            res.amount > 0
          ) {
            setAmount(res.amount);
          }
        } else {
          setRanking([]);
        }
      } catch {
        if (mounted) setRanking([]);
      }
    };

    // 방 정보로 myUserId/amount 백업
    const hydrateFromRoom = async () => {
      try {
        const roomView = await molbbangApi.fetchRoom();
        if (!mounted || !isRoom(roomView)) return;

        // myUserId 확보
        const me = roomView.members.find(
          (m: any) => norm(m.nickname) === nickname
        );
        if (me?.userId) setMyUserId(me.userId);

        // 금액 보정
        if (roomView.amount && Number.isFinite(roomView.amount)) {
          setAmount(roomView.amount);
        }
      } catch {
        // ignore
      }
    };

    const start = async () => {
      await Promise.all([fetchOnce(), hydrateFromRoom()]);

      // 결과가 비어있거나 내가 누군지 못 찾았으면 잠깐 폴링
      const haveMeNow =
        (myUserId && ranking.some((r) => r.userId === myUserId)) ||
        ranking.some((r) => norm(r.nickname) === nickname);

      if (ranking.length === 0 || !haveMeNow || !jackpotUserId) {
        if (pollRef.current) clearInterval(pollRef.current);
        retriesRef.current = 0;
        pollRef.current = setInterval(async () => {
          retriesRef.current += 1;
          await fetchOnce();
          if (retriesRef.current >= 10) {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }, 1000);
      }
    };

    start();

    return () => {
      mounted = false;
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, nickname]);

  // 내 등수(userId 우선, 실패시 닉네임 정규화)
  const myRank = useMemo(() => {
    if (!ranking.length) return null;
    let idx = -1;
    if (myUserId) idx = ranking.findIndex((r) => r.userId === myUserId);
    if (idx < 0) idx = ranking.findIndex((r) => norm(r.nickname) === nickname);
    return idx >= 0 ? idx + 1 : null;
  }, [ranking, myUserId, nickname]);

  // 잭팟 닉네임(표시용)
  const jackpotNick = useMemo(() => {
    const hit = ranking.find((r) => r.userId === jackpotUserId);
    return hit?.nickname;
  }, [ranking, jackpotUserId]);

  // ✅ "나" 엔트리(userId → 닉네임) 확정
  const me = useMemo(() => {
    if (!ranking.length) return undefined;
    return (
      (myUserId && ranking.find((r) => r.userId === myUserId)) ||
      ranking.find((r) => norm(r.nickname) === nickname)
    );
  }, [ranking, myUserId, nickname]);

  // ✅ 꼴등 판정: (1) 잭팟이 곧 결제자라면 그게 나인지 우선 확인
  //            (2) 아니면 점수 규칙(최대/최소)로 추론
  const isLoser = useMemo(() => {
    if (!ranking.length || !me) return false;

    // 잭팟=결제자 가정 시
    if (jackpotUserId && me.userId === jackpotUserId) return true;

    const totals = ranking.map((r) => r.total ?? 0);
    if (!totals.length) return false;

    const loserScore = LOSER_BY_MAX ? Math.max(...totals) : Math.min(...totals);
    if (me.total === loserScore) return true;

    // 등수 기반 보조: 내 등수가 마지막이면(동점 고려 불가 시)
    if (myRank !== null && myRank === ranking.length) return true;

    return false;
  }, [ranking, me, jackpotUserId, myRank]);

  const onBackToLobby = () => {
    router.replace({
      pathname: "/molbbang/room/[code]",
      params: { code, nick: nicknameRaw, amount: String(amount) },
    });
  };

  const onPay = () => {
    router.push({
      pathname: "/pay/payment",
      params: { code, nick: nicknameRaw, amount: String(amount) },
    });
  };

  const onExit = () => {
    router.replace("/molbbang");
  };

  // 컴포넌트 언마운트 시 방 나가기 처리
  useEffect(() => {
    return () => {
      // 컴포넌트가 언마운트될 때 방에서 나가기
      if (code) {
        molbbangApi.leaveRoom().catch((error) => {
          console.log("방 나가기 실패:", error);
        });
      }
    };
  }, [code]);

  return (
    <ResultTemplate
      code={code}
      amount={amount} // ✅ 서버 응답으로 갱신된 금액 사용
      ranking={ranking}
      myNickname={nicknameRaw}
      myRank={myRank}
      jackpotNickname={jackpotNick}
      onBackToLobby={onBackToLobby}
      onExit={onExit}
      isLoser={isLoser}
      onPay={onPay}
    />
  );
}
