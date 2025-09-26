// src/features/Lucky/screens/MolbbangLobbyScreen.tsx
import type {
  MolbbangMember,
  MolbbangRoom,
} from "@/features/Lucky/api/molbbangService";
import {
  molbbangApi,
  convertRoomViewToMolbbangRoom,
} from "@/features/Lucky/api/molbbangService";
import { useMolbbangSocket } from "@/features/Lucky/hooks/useMolbbangSocket";
import LobbyTemplate from "@/features/Lucky/templates/Molbbang/LobbyTemplate";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

// ✅ hostId 존재 여부를 안전하게 판별하는 타입 가드
function hasHostId(r: unknown): r is { hostId: string } {
  return (
    typeof r === "object" &&
    r !== null &&
    "hostId" in r &&
    typeof (r as { hostId?: unknown }).hostId === "string"
  );
}

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
    host?: string | string[]; // ✅ 추가: 내가 방장인지(클라에서 세팅)
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

  // ✅ 클라에서 넘겨준 host 플래그(“1”, “true”만 true)
  const hostFlagFromParams =
    typeof params.host === "string"
      ? params.host === "1" || params.host === "true"
      : Array.isArray(params.host)
      ? params.host[0] === "1" || params.host[0] === "true"
      : false;

  const [room, setRoom] = useState<MolbbangRoom | null>(null);
  const [accessToken, setAccessToken] = useState<string>("");

  // JWT 토큰 가져오기
  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await SecureStore.getItemAsync("access_token");
        if (token) {
          setAccessToken(token);
        }
      } catch (error) {
        console.log("토큰 가져오기 실패:", error);
      }
    };
    getToken();
  }, []);

  // HTTP 폴링 (WebSocket 연결 실패 시 대체)
  useEffect(() => {
    if (!code || connected) return; // WebSocket이 연결되면 HTTP 폴링 중단

    const fetchRoomData = async () => {
      try {
        const roomData = await molbbangApi.fetchRoom(code);
        setRoom(roomData);
      } catch (error) {
        // 에러 무시 (HTTP 인터셉터가 처리)
      }
    };

    // 초기 로드
    fetchRoomData();

    // 5초마다 폴링
    const interval = setInterval(fetchRoomData, 5000);

    return () => clearInterval(interval);
  }, [code, connected]);

  // WebSocket 연결 (토큰이 있을 때만)
  const { connected, lastRoomView, sendReady, sendStart } = useMolbbangSocket({
    wsUrl: "wss://j13b207.p.ssafy.io/api/ws",
    accessToken: accessToken || "",
    roomCode: code,
    debug: false,
    onRoomUpdate: (roomView) => {
      // RoomView를 MolbbangRoom으로 변환
      const convertedRoom = convertRoomViewToMolbbangRoom(roomView);
      setRoom(convertedRoom);
    },
    onConnect: () => {
      // WebSocket 연결됨
    },
    onDisconnect: () => {
      // WebSocket 연결 끊어짐
    },
  });

  const members: MolbbangMember[] = room?.members ?? [];
  const me = useMemo(() => {
    const found = members.find((m) => m.nickname === nickname);
    return found ?? null;
  }, [members, nickname]);

  // 웹소켓 또는 HTTP API 사용
  const handleSendReady = useCallback(
    async (ready: boolean) => {
      if (connected) {
        // 웹소켓 연결된 경우
        try {
          sendReady(ready);
          console.log("🔍 WebSocket 준비 상태 변경:", ready);
        } catch (error) {
          console.log("🔍 WebSocket 준비 상태 변경 실패:", error);
          Alert.alert("준비 상태 변경 실패", String(error));
        }
      } else {
        // HTTP API 사용 (웹소켓 연결되지 않은 경우)
        try {
          await molbbangApi.setReady(code, {
            userId: me?.userId,
            nickname,
            ready,
          });
          console.log("🔍 HTTP 준비 상태 변경:", ready);
        } catch (error) {
          console.log("🔍 HTTP 준비 상태 변경 실패:", error);
          Alert.alert("준비 상태 변경 실패", String(error));
        }
      }
    },
    [connected, sendReady, code, me?.userId, nickname]
  );

  const handleSendStart = useCallback(async () => {
    if (connected) {
      // 웹소켓 연결된 경우
      try {
        sendStart();
        console.log("🔍 WebSocket 게임 시작 요청");
      } catch (error) {
        console.log("🔍 WebSocket 게임 시작 실패:", error);
        Alert.alert("게임 시작 실패", String(error));
      }
    } else {
      // HTTP API 사용 (웹소켓 연결되지 않은 경우)
      try {
        const res = await molbbangApi.startRound(code);
        if (!res.ok) {
          Alert.alert(
            "아직 시작할 수 없어요",
            "최소 2명 이상이 모두 준비해야 합니다."
          );
          return;
        }
        console.log("🔍 HTTP 게임 시작 요청");
      } catch (error) {
        console.log("🔍 HTTP 게임 시작 실패:", error);
        Alert.alert("게임 시작 실패", String(error));
      }
    }
  }, [connected, sendStart, code]);
  const myReady = !!me?.ready;

  const presentCount = members.some((m) => typeof m.online === "boolean")
    ? members.filter((m) => m.online).length
    : members.length;
  const allReady = members.length > 0 && members.every((m) => m.ready);
  const canStart = members.length >= 2 && allReady;

  // ✅ 방장 판별: 1) hostId가 있으면 그걸로, 2) 없으면 첫 번째 멤버를 방장으로 간주(폴백)
  const isHost = useMemo(() => {
    // 내가 누구인지 모르면 params로 받은 host 플래그를 그대로 사용
    if (!room || !me) return hostFlagFromParams;

    // 서버가 hostId를 내려줬다면 string 비교로 안전 비교
    if (hasHostId(room)) {
      return String(me.userId) === String(room.hostId);
    }

    // 서버가 hostId를 안 준 경우: 최초 진입 시 받은 host 플래그 사용
    return hostFlagFromParams;
  }, [room, me, hostFlagFromParams]);

  const onToggleReady = useCallback(async () => {
    const next = !myReady;
    console.log("🔍 준비 상태 변경 시도:", next);
    await handleSendReady(next);
  }, [myReady, handleSendReady]);

  const onStart = useCallback(async () => {
    console.log("🔍 게임 시작 시도");
    await handleSendStart();
  }, [handleSendStart]);

  // LobbyTemplate에 전달되는 데이터 확인 (첫 번째 렌더링 시에만)
  if (!room) {
    console.log("🔍 LobbyTemplate props:", {
      members: members,
      meNickname: nickname,
      myReady: myReady,
      presentCount: presentCount,
      isHost: isHost,
      connected: connected,
      accessToken: accessToken ? "있음" : "없음",
    });
  }

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
      showStartButton={isHost && room?.status === "lobby"}
      onStart={onStart}
    />
  );
}
