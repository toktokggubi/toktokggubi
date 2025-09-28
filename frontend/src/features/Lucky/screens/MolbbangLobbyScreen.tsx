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
import { Clipboard } from "react-native";
import MolbbangAlert from "@/shared/ui/MolbbangAlert";

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
    roundStatus?: string | string[]; // ✅ 추가: endGame API 응답 상태
  }>();

  // Alert 상태 관리
  const [alert, setAlert] = useState<{
    visible: boolean;
    title?: string;
    message: string;
    type?: "default" | "success" | "error" | "warning";
  }>({
    visible: false,
    message: "",
  });

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

  // ✅ 클라에서 넘겨준 host 플래그("1", "true"만 true)
  const hostFlagFromParams =
    typeof params.host === "string"
      ? params.host === "1" || params.host === "true"
      : Array.isArray(params.host)
      ? params.host[0] === "1" || params.host[0] === "true"
      : false;

  // ✅ endGame API 응답 상태 파싱
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
      } catch (error) {}
    };
    getToken();
  }, []);

  // WebSocket 연결 (토큰이 있을 때만)
  const { connected, lastRoomView, sendReady } = useMolbbangSocket({
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
        const roomData = await molbbangApi.fetchRoom();

        // 방 상태 업데이트 (게임 완료 감지는 endGame API 응답으로 처리)
        setRoom(roomData);
      } catch (error) {
        // fetchRoom API 에러
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
      }

      if (connected) {
        // 웹소켓 연결된 경우
        try {
          sendReady(ready);
        } catch (error) {
          setAlert({
            visible: true,
            title: "준비 상태 변경 실패",
            message: String(error),
            type: "error",
          });
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
          setAlert({
            visible: true,
            title: "준비 상태 변경 실패",
            message: String(error),
            type: "error",
          });
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

  // 라운드 번호 추적 (자동 게임 시작 제거로 불필요해짐)
  // const currentRoundRef = useRef<number>(1);

  const handleSendStart = useCallback(async () => {
    // 중복 클릭 방지
    if (isStartingGameRef.current) {
      return;
    }

    isStartingGameRef.current = true;

    try {
      // 무조건 HTTP API로 게임 시작 (호스트 버튼 클릭으로만)
      const res = await molbbangApi.startRound();

      if (!res.ok) {
        setAlert({
          visible: true,
          title: "아직 시작할 수 없어요",
          message: "모든 참가자가 준비해야 합니다.",
          type: "warning",
        });
        return;
      }

      // 게임 시작 시 완료 상태 초기화
      setRoundCompletionStatus("none");

      // 서버 응답에서 게임 정보 업데이트
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
      }

      // 게임 시작 성공 시 즉시 게임 화면으로 이동 (호스트만)
      navigatedToGameRef.current = true; // 중복 이동 방지
      const gameParams = {
        code,
        nick: nickname,
        amount: String(amount),
        host: hostFlagFromParams ? "1" : "0",
      };

      router.push({
        pathname: "/molbbang/room/[code]/game",
        params: gameParams,
      });
    } catch (error) {
      setAlert({
        visible: true,
        title: "게임 시작 실패",
        message: String(error),
        type: "error",
      });
    } finally {
      // 2초 후 락 해제 (게임 화면 이동 시간 고려)
      setTimeout(() => {
        isStartingGameRef.current = false;
      }, 2000);
    }
  }, [code, nickname, amount, hostFlagFromParams, router]);

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

  // 이미 게임 화면으로 이동했는지 여부를 추적하여 중복 이동 방지
  const navigatedToGameRef = useRef(false);

  // 게임 상태 변경 감지 - 모든 참가자가 자동으로 게임 화면으로 이동
  useEffect(() => {
    if (room && room.status === "playing" && !navigatedToGameRef.current) {
      // 중복 이동 방지
      navigatedToGameRef.current = true;

      // 호스트는 이미 버튼 클릭으로 이동했으므로 참가자들만 자동 이동
      if (!isHost) {
        const gameParams = {
          code,
          nick: nickname,
          amount: String(amount),
          host: hostFlagFromParams ? "1" : "0",
        };

        router.push({
          pathname: "/molbbang/room/[code]/game",
          params: gameParams,
        });
      }
    }
  }, [
    room?.status,
    code,
    router,
    nickname,
    amount,
    hostFlagFromParams,
    isHost,
  ]);

  // 대기방 상태로 돌아오면 이동 락 해제
  useEffect(() => {
    if (room?.status === "lobby") {
      navigatedToGameRef.current = false;
    }
  }, [room?.status]);

  const onToggleReady = useCallback(async () => {
    const next = !myReady;
    await handleSendReady(next);
  }, [myReady, handleSendReady]);

  const onStart = useCallback(async () => {
    await handleSendStart();
  }, [handleSendStart]);

  // 방 코드 복사 기능
  const onCopyCode = useCallback(async () => {
    try {
      await Clipboard.setString(code);
      setAlert({
        visible: true,
        title: "복사 완료",
        message: `방 코드 ${code}가 클립보드에 복사되었습니다.`,
        type: "success",
      });
    } catch (error) {
      setAlert({
        visible: true,
        title: "복사 실패",
        message: "방 코드 복사에 실패했습니다.",
        type: "error",
      });
    }
  }, [code]);

  // 게임 완료 상태 관리 (endGame API 응답 기반)
  const [roundCompletionStatus, setRoundCompletionStatus] = useState<
    "none" | "lobby" | "finished"
  >("none");

  // endGame API 응답을 받아서 roundCompletionStatus 업데이트하는 함수
  const handleRoundCompletion = useCallback((status: "lobby" | "finished") => {
    setRoundCompletionStatus(status);
  }, []);

  // URL 파라미터로 받은 roundStatus 처리
  useEffect(() => {
    if (
      roundStatusFromParams === "lobby" ||
      roundStatusFromParams === "finished"
    ) {
      setRoundCompletionStatus(roundStatusFromParams);
    }
  }, [roundStatusFromParams]);

  // 닉네임 변경 알림 처리
  useEffect(() => {
    if (me?.nickname && nickname && me.nickname !== nickname) {
      // TODO: 사용자에게 닉네임 변경 알림 표시
      // Alert.alert("닉네임 변경", `닉네임이 "${me.nickname}"으로 변경되었습니다.`);
    }
  }, [me?.nickname, nickname]);

  // 라운드 번호는 더 이상 표시하지 않음 (게임 한 번만 진행)

  const canStart = useMemo(() => {
    // 게임 시작 전 또는 게임 완전 종료 후에만 준비 가능
    return (
      members.length >= 1 &&
      allReady &&
      (roundCompletionStatus === "none" || roundCompletionStatus === "finished")
    );
  }, [members.length, allReady, roundCompletionStatus]);

  // 라운드 관련 디버깅 제거 (게임 한 번만 진행)

  return (
    <>
      <LobbyTemplate
        code={code}
        amount={room?.amount ?? amount} // 서버에서 받은 금액 우선 사용
        round={1} // 라운드는 항상 1로 고정
        totalRounds={1} // 총 라운드도 1로 고정
        members={members}
        presentCount={presentCount}
        meNickname={me?.nickname || nickname}
        myReady={myReady}
        allReady={allReady}
        canStart={canStart}
        onToggleReady={onToggleReady}
        onStart={onStart}
        onCopyCode={onCopyCode} // 방 코드 복사 기능 추가
        showStartButton={isHost} // 호스트가 아닌 경우 게임시작 버튼 숨김
      />

      <MolbbangAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={() => setAlert({ ...alert, visible: false })}
      />
    </>
  );
}
