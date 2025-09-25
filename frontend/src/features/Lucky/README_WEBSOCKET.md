# 몰빵 웹소켓 연동 가이드

이 문서는 프론트엔드에서 백엔드 웹소켓과 연동하는 방법을 설명합니다.

## 개요

백엔드는 Spring Boot WebSocket + STOMP 프로토콜을 사용하여 실시간 통신을 제공합니다.
프론트엔드는 `@stomp/stompjs` 라이브러리를 사용하여 웹소켓에 연결합니다.

## 백엔드 웹소켓 설정

- **엔드포인트**: `/ws` (SockJS 지원)
- **메시지 브로커**: `/topic`, `/queue`
- **애플리케이션 프리픽스**: `/app`
- **인증**: JWT 토큰 기반
- **하트비트**: 10초 간격

## 프론트엔드 구현

### 1. 기본 웹소켓 연결

```typescript
import { molbbangApi } from "../api/molbbangService";

// 웹소켓 연결
await molbbangApi.connectWebSocket(
  roomCode,
  (room) => {
    console.log("방 상태 업데이트:", room);
  },
  true // debug 모드
);
```

### 2. 훅 사용법

```typescript
import { useMolbbangWebSocket } from "../hooks/useMolbbangWebSocket";

function MolbbangGameScreen({ roomCode }: { roomCode: string }) {
  const { connected, room, error, sendReady, sendStart, sendScore, sendEnd } =
    useMolbbangWebSocket({
      roomCode,
      autoConnect: true,
      debug: true,
      onRoomUpdate: (updatedRoom) => {
        // 방 상태 업데이트 처리
        console.log("Room updated:", updatedRoom);
      },
    });

  const handleReady = () => {
    sendReady(true);
  };

  const handleStartGame = () => {
    sendStart();
  };

  const handleSubmitScore = (score: number) => {
    sendScore(score);
  };

  return (
    <View>
      <Text>연결 상태: {connected ? "연결됨" : "연결 안됨"}</Text>
      {room && (
        <View>
          <Text>방 코드: {room.code}</Text>
          <Text>상태: {room.status}</Text>
          <Text>멤버 수: {room.members.length}</Text>
        </View>
      )}
      <Button title="준비" onPress={handleReady} />
      <Button title="게임 시작" onPress={handleStartGame} />
    </View>
  );
}
```

### 3. 직접 API 사용

```typescript
import { molbbangApi } from "../api/molbbangService";

// 웹소켓 메시지 전송
molbbangApi.sendWebSocketReady(true); // 준비 상태 변경
molbbangApi.sendWebSocketStart(); // 게임 시작
molbbangApi.sendWebSocketScore(85); // 점수 제출
molbbangApi.sendWebSocketEnd(); // 라운드 종료

// 연결 상태 확인
const isConnected = molbbangApi.isWebSocketConnected();

// 연결 해제
molbbangApi.disconnectWebSocket();
```

## 웹소켓 메시지 매핑

백엔드에서 처리하는 웹소켓 메시지:

| 프론트엔드 전송          | 백엔드 매핑                            | 설명           |
| ------------------------ | -------------------------------------- | -------------- |
| `/app/molbbang/me/ready` | `@MessageMapping("molbbang/me/ready")` | 준비 상태 변경 |
| `/app/molbbang/me/start` | `@MessageMapping("molbbang/me/start")` | 게임 시작      |
| `/app/molbbang/me/score` | `@MessageMapping("molbbang/me/score")` | 점수 제출      |
| `/app/molbbang/me/end`   | `@MessageMapping("molbbang/me/end")`   | 라운드 종료    |

## 구독 토픽

백엔드에서 발송하는 메시지 구독:

| 토픽                         | 설명                                            |
| ---------------------------- | ----------------------------------------------- |
| `/topic/molbbang.{roomCode}` | 방 상태 업데이트 (모든 참가자에게 브로딩캐스트) |

## 인증

웹소켓 연결 시 JWT 토큰이 필요합니다:

```typescript
// Authorization 헤더로 전달
connectHeaders: {
  Authorization: `Bearer ${accessToken}`,
}

// 또는 쿼리 파라미터로 전달 (프론트엔드 편의용)
// wss://api.example.com/ws?token=your_jwt_token
```

## 에러 처리

```typescript
try {
  await molbbangApi.connectWebSocket(roomCode, onRoomUpdate);
} catch (error) {
  if (error.message === "No access token found") {
    // 토큰이 없는 경우 - 로그인 페이지로 이동
  } else {
    // 기타 연결 오류
    console.error("WebSocket 연결 실패:", error);
  }
}
```

## 디버깅

디버그 모드를 활성화하면 콘솔에서 STOMP 메시지를 확인할 수 있습니다:

```typescript
await molbbangApi.connectWebSocket(roomCode, onRoomUpdate, true); // debug: true
```

## 예시 컴포넌트

`MolbbangWebSocketExample.tsx` 파일에서 완전한 사용 예시를 확인할 수 있습니다.

## 주의사항

1. **자동 재연결**: 네트워크 연결이 끊어지면 자동으로 재연결을 시도합니다.
2. **메모리 누수 방지**: 컴포넌트 언마운트 시 반드시 `disconnect()`를 호출하세요.
3. **토큰 갱신**: 토큰이 만료되면 연결이 끊어질 수 있습니다.
4. **동시 연결**: 같은 방에 여러 개의 웹소켓 연결을 만들지 마세요.

## 백엔드 연동 확인

백엔드 웹소켓 설정이 올바른지 확인하려면:

1. `/ws` 엔드포인트가 활성화되어 있는지
2. CORS 설정이 올바른지
3. JWT 인증이 정상 작동하는지
4. STOMP 메시지 브로커가 설정되어 있는지

확인하세요.
