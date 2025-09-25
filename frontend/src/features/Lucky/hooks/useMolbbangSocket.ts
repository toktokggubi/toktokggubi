import { Client, IMessage, StompHeaders } from "@stomp/stompjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RoomView } from "../api/types";

// ✅ SockJS 사용을 위해 SockJS 클라이언트 설정
// 백엔드에서 .withSockJS()를 사용하므로 SockJS 엔드포인트 사용

type Options = {
  wsUrl: string; // e.g. wss://api.example.com/ws-stomp
  accessToken: string; // JWT
  roomCode: string; // 구독할 방 코드
  onRoomUpdate?: (rv: RoomView) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  debug?: boolean;
};

export function useMolbbangSocket(opts: Options) {
  const {
    wsUrl,
    accessToken,
    roomCode,
    onRoomUpdate,
    onConnect,
    onDisconnect,
    debug,
  } = opts;
  const [connected, setConnected] = useState(false);
  const [lastRoomView, setLastRoomView] = useState<RoomView | null>(null);

  const clientRef = useRef<Client | null>(null);
  const subIdRef = useRef<string | null>(null);

  const headers: StompHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${accessToken}`, // <- Spring Security 필터에서 읽을 수 있게
    }),
    [accessToken]
  );

  const log = useCallback(
    (...args: any[]) => {
      if (debug) console.log("[STOMP]", ...args);
    },
    [debug]
  );

  const connect = useCallback(() => {
    if (clientRef.current?.connected) return;

    if (!accessToken || accessToken.trim() === "") {
      return;
    }

    const wsUrlWithToken = `${wsUrl}?token=${encodeURIComponent(accessToken)}`;

    const client = new Client({
      brokerURL: wsUrlWithToken,
      connectHeaders: {
        ...headers,
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "ReactNative",
        Accept: "application/json",
      },
      reconnectDelay: 2000, // 자동 재연결(ms). 지수 백오프는 직접 구현 가능
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => debug && console.log(str), // 몰빵 웹소켓 로그만 유지
      onConnect: () => {
        setConnected(true);
        onConnect?.();

        // 구독
        const dest = `/topic/molbbang.${roomCode}`;
        const sub = client.subscribe(dest, (msg: IMessage) => {
          try {
            const body = JSON.parse(msg.body) as RoomView;
            setLastRoomView(body);
            onRoomUpdate?.(body);
          } catch (e) {
            // JSON 파싱 에러 무시
          }
        });

        subIdRef.current = sub.id;
      },
      onStompError: (frame) => {
        // STOMP 에러 무시
      },
      onWebSocketError: (ev) => {
        // WebSocket 에러 무시
      },
      onDisconnect: () => {
        setConnected(false);
        onDisconnect?.();
      },
    });

    client.activate();
    clientRef.current = client;
  }, [
    wsUrl,
    headers,
    roomCode,
    onConnect,
    onDisconnect,
    onRoomUpdate,
    log,
    debug,
    accessToken,
  ]);

  const disconnect = useCallback(() => {
    const client = clientRef.current;
    if (!client) return;

    try {
      if (subIdRef.current && client.connected) {
        client.unsubscribe(subIdRef.current);
      }
    } catch {}
    subIdRef.current = null;

    if (client.active) client.deactivate(); // 안전 종료
    clientRef.current = null;
    setConnected(false);
  }, []);

  // lifecycle
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  // ======== Send helpers (/app/...) ========

  const sendJson = useCallback(
    (destination: string, body: any) => {
      const client = clientRef.current;
      if (!client?.connected) throw new Error("STOMP not connected");
      client.publish({
        destination,
        headers,
        body: body ? JSON.stringify(body) : "{}",
      });
      log("SEND", destination, body);
    },
    [headers, log]
  );

  const sendReady = useCallback(
    (ready: boolean) => {
      sendJson("/app/molbbang/me/ready", { ready });
    },
    [sendJson]
  );

  const sendStart = useCallback(() => {
    sendJson("/app/molbbang/me/start", {});
  }, [sendJson]);

  const sendScore = useCallback(
    (score: number) => {
      sendJson("/app/molbbang/me/score", { score });
    },
    [sendJson]
  );

  const sendEnd = useCallback(() => {
    sendJson("/app/molbbang/me/end", {});
  }, [sendJson]);

  return {
    connected,
    lastRoomView,
    connect,
    disconnect,
    sendReady,
    sendStart,
    sendScore,
    sendEnd,
  };
}
