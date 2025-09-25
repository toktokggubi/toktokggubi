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
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

  // WebSocket 연결 (토큰이 있을 때만)
  const { connected, lastRoomView, sendReady, sendStart } = useMolbbangSocket({
    wsUrl: "wss://j13b207.p.ssafy.io/api/ws",
    accessToken: accessToken || "",
    roomCode: code,
    debug: false,
    onRoomUpdate: (roomView) => {
      setRoom(convertRoomViewToMolbbangRoom(roomView));
    },
  });

  // HTTP 폴링 (WebSocket 연결 실패 시 대체)
  useEffect(() => {
    if (!code || connected) {
      return; // WebSocket이 연결되면 HTTP 폴링 중단
    }

    const fetchRoomData = async () => {
      try {
        const roomData = await molbbangApi.fetchRoom(code);

        // 상태나 라운드가 변경된 경우에만 로그 출력
        if (
          roomData?.status !== room?.status ||
          roomData?.round !== room?.round
        ) {
          console.log("🔍 [대기방 폴링] 상태 변경 감지:", {
            이전상태: room?.status,
            새상태: roomData?.status,
            이전라운드: room?.round,
            새라운드: roomData?.round,
            멤버수: roomData?.members?.length,
          });

          // 게임이 끝나고 대기방으로 돌아왔을 때 준비 상태 초기화
          if (room?.status === "playing" && roomData?.status === "lobby") {
            console.log(
              "🔍 [대기방] 게임 종료 후 대기방 복귀 - 준비 상태 초기화"
            );
            // 모든 멤버의 준비 상태를 false로 설정
            if (roomData.members) {
              roomData.members = roomData.members.map((member) => ({
                ...member,
                ready: false,
              }));
            }
          }

          // 라운드가 변경되었을 때도 준비 상태 초기화
          if (room?.round !== roomData?.round && roomData?.status === "lobby") {
            console.log("🔍 [대기방] 라운드 변경 - 준비 상태 초기화");
            if (roomData.members) {
              roomData.members = roomData.members.map((member) => ({
                ...member,
                ready: false,
              }));
            }
          }
        }

        setRoom(roomData);
      } catch (error) {
        console.log("🔍 [대기방 폴링] 에러:", error);
        // 에러 무시 (HTTP 인터셉터가 처리)
      }
    };

    // 초기 로드
    fetchRoomData();

    // 5초마다 폴링
    const interval = setInterval(fetchRoomData, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [code, connected, room?.status, room?.round]);

  const members: MolbbangMember[] = room?.members ?? [];
  const me = useMemo(() => {
    const found = members.find((m) => m.nickname === nickname);
    return found ?? null;
  }, [members, nickname]);

  // 웹소켓 또는 HTTP API 사용
  const handleSendReady = useCallback(
    async (ready: boolean) => {
      // 즉시 로컬 상태 업데이트 (낙관적 업데이트)
      if (room && me) {
        const updatedRoom = {
          ...room,
          members: room.members.map((member) =>
            member.userId === me.userId ? { ...member, ready } : member
          ),
        };
        setRoom(updatedRoom);
      }

      if (connected) {
        // 웹소켓 연결된 경우
        try {
          sendReady(ready);
        } catch (error) {
          Alert.alert("준비 상태 변경 실패", String(error));
          // 실패 시 원래 상태로 되돌리기
          if (room && me) {
            const revertedRoom = {
              ...room,
              members: room.members.map((member) =>
                member.userId === me.userId
                  ? { ...member, ready: !ready }
                  : member
              ),
            };
            setRoom(revertedRoom);
          }
        }
      } else {
        // HTTP API 사용 (웹소켓 연결되지 않은 경우)
        try {
          await molbbangApi.setReady(code, {
            userId: me?.userId,
            nickname,
            ready,
          });
        } catch (error) {
          Alert.alert("준비 상태 변경 실패", String(error));
          // 실패 시 원래 상태로 되돌리기
          if (room && me) {
            const revertedRoom = {
              ...room,
              members: room.members.map((member) =>
                member.userId === me.userId
                  ? { ...member, ready: !ready }
                  : member
              ),
            };
            setRoom(revertedRoom);
          }
        }
      }
    },
    [connected, sendReady, code, me?.userId, me, nickname, room]
  );

  const handleSendStart = useCallback(async () => {
    if (connected) {
      // 웹소켓 연결된 경우
      try {
        sendStart();
      } catch (error) {
        Alert.alert("게임 시작 실패", String(error));
      }
    } else {
      // HTTP API 사용 (웹소켓 연결되지 않은 경우)
      try {
        const res = await molbbangApi.startRound(code);
        if (!res.ok) {
          Alert.alert(
            "아직 시작할 수 없어요",
            "모든 참가자가 준비해야 합니다."
          );
          return;
        }
        // 게임 시작 성공 시 즉시 게임 화면으로 이동
        router.push(`/molbbang/room/${code}/game`);
      } catch (error) {
        Alert.alert("게임 시작 실패", String(error));
      }
    }
  }, [connected, sendStart, code, router]);

  // 이미 게임 화면으로 이동했는지 여부를 추적하여 중복 이동 방지
  const navigatedToGameRef = useRef(false);

  // 게임 상태 변경 감지 (WebSocket으로 게임 시작 시 화면 전환)
  useEffect(() => {
    if (room && room.status === "playing") {
      // 준비된 멤버가 있는지 확인
      const readyMembers = room.members?.filter((m) => m.ready) || [];

      // 준비된 멤버가 없으면 이동하지 않음
      if (readyMembers.length === 0) {
        console.log("🔍 [대기방] 준비된 멤버 없음 - 이동 취소");
        return;
      }

      // 이미 이동한 경우 중복 이동 방지
      if (navigatedToGameRef.current) {
        return;
      }
      navigatedToGameRef.current = true;

      console.log("🔍 [대기방] 게임 시작 - 게임 화면으로 이동");
      router.push({
        pathname: "/molbbang/room/[code]/game",
        params: {
          code,
          nick: nickname,
          amount,
          host: hostFlagFromParams ? "1" : "0",
        },
      });
    }
  }, [
    room?.status,
    room?.round, // 라운드 변경도 감지
    code,
    router,
    nickname,
    amount,
    hostFlagFromParams,
    connected,
  ]);

  // 대기방 상태로 돌아오면 이동 락 해제
  useEffect(() => {
    if (room?.status === "lobby") {
      navigatedToGameRef.current = false;
    }
  }, [room?.status]);

  const myReady = !!me?.ready;

  const presentCount = members.some((m) => typeof m.online === "boolean")
    ? members.filter((m) => m.online).length
    : members.length;
  const allReady = members.length > 0 && members.every((m) => m.ready);
  const canStart = members.length >= 1 && allReady;

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
    await handleSendReady(next);
  }, [myReady, handleSendReady]);

  const onStart = useCallback(async () => {
    await handleSendStart();
  }, [handleSendStart]);

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
