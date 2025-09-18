import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { molbbangApi } from "@/features/Lucky/api/molbbangService";
import type {
  MolbbangRoom,
  MolbbangMember,
} from "@/features/Lucky/api/molbbangService";
import LobbyTemplate from "@/features/Lucky/templates/Molbbang/LobbyTemplate";

function isRoom(v: unknown): v is MolbbangRoom {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.code === "string" &&
    typeof o.amount === "number" &&
    typeof o.round === "number" &&
    typeof o.totalRounds === "number" &&
    (o.status === "lobby" ||
      o.status === "playing" ||
      o.status === "finished") &&
    Array.isArray(o.members)
  );
}

export default function MolbbangLobbyScreen() {
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

  // 폴링
  useEffect(() => {
    if (!code) return;
    const tm = setInterval(async () => {
      try {
        const r = await molbbangApi.fetchRoom(code);
        if (isRoom(r)) {
          setRoom(r);
          if (r.status === "playing") {
            router.replace({
              pathname: "/molbbang/room/[code]/game",
              params: {
                code,
                nick: nickname,
                amount,
                host: hostFlagFromParams ? "1" : "0",
              },
            });
          }
        }
      } catch {
        // ignore
      }
    }, 1000);
    return () => clearInterval(tm);
  }, [code, nickname, amount, router]);

  const members: MolbbangMember[] = room?.members ?? [];
  const me = useMemo(
    () => members.find((m) => m.nickname === nickname) ?? null,
    [members, nickname]
  );
  const myReady = !!me?.ready;

  const presentCount = members.some((m) => typeof m.online === "boolean")
    ? members.filter((m) => m.online).length
    : members.length;

  const allReady = members.length > 0 && members.every((m) => m.ready);
  const canStart = members.length >= 2 && allReady;

  const onToggleReady = useCallback(async () => {
    if (!code) return;
    const next = !myReady;
    await molbbangApi.setReady(code, {
      userId: me?.userId,
      nickname,
      ready: next,
    });
    // 낙관 갱신
    setRoom((prev) =>
      prev
        ? {
            ...prev,
            members: prev.members.map((m) =>
              (me && m.userId === me.userId) || m.nickname === nickname
                ? { ...m, ready: next }
                : m
            ),
          }
        : prev
    );
  }, [code, me, myReady, nickname]);

  const onStart = useCallback(async () => {
    if (!code) return;
    const res = await molbbangApi.startRound(code);
    if (!res.ok) {
      Alert.alert(
        "아직 시작할 수 없어요",
        "최소 2명 이상이 모두 준비해야 합니다."
      );
      return;
    }
    router.replace({
      pathname: "/molbbang/room/[code]/game",
      params: { code, nick: nickname, amount, host: isHost ? "1" : "0" },
    });
  }, [code, nickname, amount, router]);

  return (
    <LobbyTemplate
      code={code}
      amount={amount}
      round={room?.round ?? 1}
      totalRounds={room?.totalRounds ?? 3}
      members={members}
      presentCount={presentCount}
      meNickname={nickname}
      myReady={myReady}
      allReady={allReady}
      canStart={canStart}
      onToggleReady={onToggleReady}
      onStart={onStart}
    />
  );
}
