// src/features/Lucky/screens/MolbbangLobbyScreen.tsx
import type {
  MolbbangMember,
  MolbbangRoom,
} from "@/features/Lucky/api/molbbangService";

// 전역 변수 타입 선언
declare global {
  interface Window {
    __lobbyParamsLogged?: boolean;
  }
}
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
    roundStatus?: string | string[]; // ✅ 추가: endRound API 응답 상태
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

  // URL 파라미터 디버깅 (한 번만 출력)
  if (typeof window !== "undefined" && !window.__lobbyParamsLogged) {
    console.log("🔍 [대기방] URL 파라미터 받기:", {
      rawParams: params,
      parsedCode: code,
      parsedNickname: nickname,
      parsedAmount: amount,
      hostFlag: params.host,
    });
    window.__lobbyParamsLogged = true;
  }

  // ✅ 클라에서 넘겨준 host 플래그("1", "true"만 true)
  const hostFlagFromParams =
    typeof params.host === "string"
      ? params.host === "1" || params.host === "true"
      : Array.isArray(params.host)
      ? params.host[0] === "1" || params.host[0] === "true"
      : false;

  // ✅ endRound API 응답 상태 파싱
  const roundStatusFromParams =
    typeof params.roundStatus === "string"
      ? params.roundStatus
      : Array.isArray(params.roundStatus)
      ? params.roundStatus[0]
      : undefined;

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
        console.log("🔍 [fetchRoom API] 요청 시작");
        const roomData = await molbbangApi.fetchRoom();
        console.log("🔍 [fetchRoom API] 응답 받음:", {
          status: roomData?.status,
          round: roomData?.round,
          totalRounds: roomData?.totalRounds,
          membersCount: roomData?.members?.length,
          members: roomData?.members?.map((m) => ({
            nickname: m.nickname,
            ready: m.ready,
          })),
        });

        // 방 상태 업데이트 (라운드 완료 감지는 endRound API 응답으로 처리)
        setRoom(roomData);
      } catch (error) {
        console.log("🔍 [fetchRoom API] 에러:", error);
      }
    };

    // 초기 로드
    fetchRoomData();

    // 5초마다 폴링
    const interval = setInterval(fetchRoomData, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [code, connected]);

  const members: MolbbangMember[] = room?.members ?? [];
  const me = useMemo(() => {
    // 서버에서 받은 실제 닉네임으로 me 객체 찾기
    // TODO: 실제로는 사용자 인증 정보(userId)로 찾아야 함
    // 현재는 임시로 첫 번째 멤버를 사용 (백엔드에서 사용자별로 정렬되어 있다고 가정)
    let found = null;
    if (room?.members && room.members.length > 0) {
      found = members[0];
      console.log("🔍 [me 객체] 서버에서 받은 실제 닉네임:", found.nickname);
    }

    return found ?? null;
  }, [members, room?.members]);

  // 웹소켓 또는 HTTP API 사용
  const handleSendReady = useCallback(
    async (ready: boolean) => {
      // 게임 진행 중일 때는 준비 상태 변경 불가 (단, 서버 오류인 경우는 예외)
      if (room?.status === "playing" && room?.round && room.round > 2) {
        return;
      }

      // me 객체가 없으면 준비 상태 변경 불가
      if (!me) {
        return;
      }

      // 이미 같은 상태라면 변경하지 않음
      if (me.ready === ready) {
        return;
      }

      // 즉시 로컬 상태 업데이트 (낙관적 업데이트)
      if (room && me) {
        const updatedRoom = {
          ...room,
          members: room.members.map((member) =>
            member.userId === me.userId ? { ...member, ready } : member
          ),
        };
        setRoom(updatedRoom);
        console.log(
          "🔍 [준비 상태 변경] 로컬 상태 업데이트 완료:",
          updatedRoom.members.find((m) => m.userId === me.userId)?.ready
        );
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
          await molbbangApi.setReady({
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

  // 게임 시작 중복 클릭 방지
  const isStartingGameRef = useRef(false);

  // 라운드 번호 추적 (백엔드에서 라운드 번호가 제대로 관리되지 않는 문제 해결)
  const currentRoundRef = useRef<number>(1);

  const handleSendStart = useCallback(async () => {
    // 중복 클릭 방지
    if (isStartingGameRef.current) {
      return;
    }

    isStartingGameRef.current = true;

    try {
      if (connected) {
        // 웹소켓 연결된 경우
        sendStart();
      } else {
        // HTTP API 사용 (웹소켓 연결되지 않은 경우)
        const res = await molbbangApi.startRound();

        if (!res.ok) {
          Alert.alert(
            "아직 시작할 수 없어요",
            "모든 참가자가 준비해야 합니다."
          );
          return;
        }

        // 라운드 시작 시 완료 상태 초기화
        setRoundCompletionStatus("none");

        // 서버 응답에서 라운드 정보 업데이트

        if (res.round !== undefined && res.round !== null) {
          setRoom((prevRoom) => {
            if (prevRoom) {
              return {
                ...prevRoom,
                round: res.round!,
                status: "playing" as const,
              };
            }
            return prevRoom;
          });
        } else {
          console.warn("🔍 [게임 시작] 라운드 정보 없음 - 업데이트 건너뜀");
        }

        // 게임 시작 성공 시 즉시 게임 화면으로 이동
        const gameParams = {
          code,
          nick: nickname,
          amount: String(amount),
          host: hostFlagFromParams ? "1" : "0",
        };

        console.log("🔍 [대기방] 게임 화면으로 파라미터 전달:", {
          pathname: "/molbbang/room/[code]/game",
          params: gameParams,
        });

        router.push({
          pathname: "/molbbang/room/[code]/game",
          params: gameParams,
        });
      }
    } catch (error) {
      Alert.alert("게임 시작 실패", String(error));
    } finally {
      // 2초 후 락 해제 (게임 화면 이동 시간 고려)
      setTimeout(() => {
        isStartingGameRef.current = false;
      }, 2000);
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
        console.log("🔍 [대기방] 이미 게임 화면으로 이동함 - 중복 이동 방지");
        return;
      }

      // 게임 시작 중이면 잠시 대기
      if (isStartingGameRef.current) {
        console.log("🔍 [대기방] 게임 시작 중 - 이동 지연");
        return;
      }

      navigatedToGameRef.current = true;

      console.log("🔍 [대기방] 게임 시작 - 게임 화면으로 이동");
      // 서버에서 받은 라운드 번호 사용 (백엔드에서 게임 시작 시 라운드 증가)
      currentRoundRef.current = room.round || 1;
      console.log(
        "🔍 [라운드 설정] 서버 라운드 번호:",
        currentRoundRef.current
      );

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
    room?.status, // 라운드 변경 감지 제거 - 상태 변경만 감지
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

  // 라운드 완료 상태 관리 (endRound API 응답 기반)
  const [roundCompletionStatus, setRoundCompletionStatus] = useState<
    "none" | "lobby" | "finished"
  >("none");

  // endRound API 응답을 받아서 roundCompletionStatus 업데이트하는 함수
  const handleRoundCompletion = useCallback((status: "lobby" | "finished") => {
    console.log("🔍 [라운드 완료] endRound API 응답 받음:", status);
    setRoundCompletionStatus(status);
  }, []);

  // URL 파라미터로 받은 roundStatus 처리
  useEffect(() => {
    if (
      roundStatusFromParams === "lobby" ||
      roundStatusFromParams === "finished"
    ) {
      console.log("🔍 [URL 파라미터] roundStatus 받음:", roundStatusFromParams);
      setRoundCompletionStatus(roundStatusFromParams);
    }
  }, [roundStatusFromParams]);

  // 닉네임 변경 알림 처리
  useEffect(() => {
    if (me?.nickname && nickname && me.nickname !== nickname) {
      console.log(
        "🔍 [닉네임 변경] 서버 닉네임과 URL 파라미터 닉네임이 다름:",
        {
          serverNickname: me.nickname,
          urlNickname: nickname,
        }
      );
      // TODO: 사용자에게 닉네임 변경 알림 표시
      // Alert.alert("닉네임 변경", `닉네임이 "${me.nickname}"으로 변경되었습니다.`);
    }
  }, [me?.nickname, nickname]);

  // 라운드 번호 계산 (사용자 친화적으로 +1 표시)
  const displayRound = useMemo(() => {
    if (!room) return 1;

    // 백엔드 버그 보정: 방 생성 시 room.round가 1로 설정되는 문제
    // lobby 상태이고 round가 1이면 실제로는 게임 시작 전이므로 0으로 처리
    let serverRound = room.round || 0;
    if (room.status === "lobby" && serverRound === 1) {
      serverRound = 0; // 게임 시작 전 상태로 보정
    }

    console.log("🔍 [라운드 계산] 디버깅:", {
      originalRound: room.round,
      correctedServerRound: serverRound,
      roundCompletionStatus,
      roomStatus: room.status,
      totalRounds: room.totalRounds,
    });

    if (roundCompletionStatus === "lobby") {
      // 라운드 완료, 다음 라운드 대기: serverRound + 1
      const result = Math.min(serverRound + 1, room.totalRounds || 3);
      console.log("🔍 [라운드 계산] lobby 상태:", result);
      return result;
    } else if (roundCompletionStatus === "finished") {
      // 게임 완전 종료: 현재 라운드 + 1
      const result = Math.min(serverRound + 1, room.totalRounds || 3);
      console.log("🔍 [라운드 계산] finished 상태:", result);
      return result;
    } else {
      // 게임 진행 중 또는 게임 시작 전: serverRound + 1
      const result = Math.min(serverRound + 1, room.totalRounds || 3);
      console.log("🔍 [라운드 계산] 기본 상태:", result);
      return result;
    }
  }, [room, roundCompletionStatus]);

  const canStart = useMemo(() => {
    // 게임 시작 전, 라운드 완료 후, 또는 게임 완전 종료 후 모두 준비 가능
    return (
      members.length >= 1 &&
      allReady &&
      (roundCompletionStatus === "none" ||
        roundCompletionStatus === "lobby" ||
        roundCompletionStatus === "finished")
    );
  }, [members.length, allReady, roundCompletionStatus]);

  // 라운드 판단 디버깅
  useEffect(() => {
    console.log("🔍 [라운드 판단] 상태 분석:", {
      serverRound: room?.round,
      serverStatus: room?.status,
      roundCompletionStatus: roundCompletionStatus,
      displayRound: displayRound,
      totalRounds: room?.totalRounds,
      isGameInProgress:
        roundCompletionStatus === "none" && room?.status === "playing",
      isWaitingForNextRound: roundCompletionStatus === "lobby",
      isGameFinished: roundCompletionStatus === "finished",
    });
  }, [
    room?.round,
    room?.status,
    roundCompletionStatus,
    displayRound,
    room?.totalRounds,
  ]);

  return (
    <LobbyTemplate
      code={code}
      amount={room?.amount ?? amount} // 서버에서 받은 금액 우선 사용
      round={displayRound} // 계산된 라운드 번호 사용
      totalRounds={room?.totalRounds ?? 3}
      members={members}
      presentCount={presentCount}
      meNickname={me?.nickname || nickname}
      myReady={myReady}
      allReady={allReady}
      canStart={canStart}
      onToggleReady={onToggleReady}
      onStart={onStart}
    />
  );
}
