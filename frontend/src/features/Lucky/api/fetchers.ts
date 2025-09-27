import { http } from "@/shared/api/http";
import { MOLBBANG_ENDPOINTS } from "./endpoints";
import { handleMolbbangError } from "./errors";
import * as SecureStore from "expo-secure-store";
import type {
  CreateRoomRequest,
  CreateRoomResponse,
  JoinRoomRequest,
  OkResponse,
  ReadyRequest,
  ResultsResponse,
  RoomView,
  GameEndResponse,
  StartRoundResponse,
  SubmitScoreRequest,
} from "./types";

// ===== 방 생성 =====
export async function createRoom(
  req: CreateRoomRequest
): Promise<CreateRoomResponse> {
  try {
    const response = await http.post<CreateRoomResponse>(
      MOLBBANG_ENDPOINTS.createRoom,
      req
    );
    return response.data;
  } catch (error: any) {
    throw handleMolbbangError(error);
  }
}

// ===== 방 참가 =====
export async function joinRoom(req: JoinRoomRequest): Promise<OkResponse> {
  try {
    const response = await http.post<OkResponse>(
      MOLBBANG_ENDPOINTS.joinRoom,
      req
    );
    return response.data;
  } catch (error: any) {
    throw handleMolbbangError(error);
  }
}

// ===== 내 방 정보 조회 =====
export async function getMyRoom(): Promise<RoomView> {
  try {
    const response = await http.get<RoomView>(MOLBBANG_ENDPOINTS.myRoom);
    return response.data;
  } catch (error: any) {
    throw handleMolbbangError(error);
  }
}

// ===== 준비 상태 변경 =====
export async function setReady(req: ReadyRequest): Promise<OkResponse> {
  try {
    const response = await http.patch<OkResponse>(
      MOLBBANG_ENDPOINTS.setReady,
      req
    );
    return response.data;
  } catch (error: any) {
    throw handleMolbbangError(error);
  }
}

// ===== 방 나가기 =====
export async function leaveRoom(): Promise<OkResponse> {
  try {
    const response = await http.patch<OkResponse>(MOLBBANG_ENDPOINTS.leaveRoom);
    return response.data;
  } catch (error: any) {
    throw handleMolbbangError(error);
  }
}

// ===== 게임 시작 =====
export async function startGame(): Promise<StartRoundResponse> {
  try {
    const response = await http.post<StartRoundResponse>(
      MOLBBANG_ENDPOINTS.startGame
    );
    return response.data;
  } catch (error: any) {
    throw handleMolbbangError(error);
  }
}

// ===== 점수 제출 =====
export async function submitScore(
  req: SubmitScoreRequest
): Promise<OkResponse> {
  try {
    const response = await http.post<OkResponse>(
      MOLBBANG_ENDPOINTS.submitScore,
      req
    );
    return response.data;
  } catch (error: any) {
    throw handleMolbbangError(error);
  }
}

// ===== 게임 종료 =====
export async function endGame(): Promise<GameEndResponse> {
  try {
    console.log(
      "🔍 [Fetcher] endGame 호출 시작, URL:",
      MOLBBANG_ENDPOINTS.endGame
    );
    const response = await http.post<GameEndResponse>(
      MOLBBANG_ENDPOINTS.endGame
    );
    console.log("🔍 [Fetcher] endGame 응답:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ [Fetcher] endGame 오류:", error);
    console.error("❌ [Fetcher] endGame 오류 상세:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });
    throw handleMolbbangError(error);
  }
}

// ===== 최종 결과 조회 =====
export async function getResults(): Promise<ResultsResponse> {
  try {
    console.log(
      "🔍 [Fetcher] getResults 호출 시작, URL:",
      MOLBBANG_ENDPOINTS.getResults
    );

    // 토큰 확인
    const token = await SecureStore.getItemAsync("access_token");
    const refreshToken = await SecureStore.getItemAsync("refresh_token");
    console.log("🔍 [Fetcher] 현재 토큰 존재 여부:", !!token);
    console.log("🔍 [Fetcher] 리프레시 토큰 존재 여부:", !!refreshToken);
    console.log(
      "🔍 [Fetcher] 토큰 일부:",
      token ? token.substring(0, 20) + "..." : "없음"
    );
    console.log(
      "🔍 [Fetcher] 리프레시 토큰 일부:",
      refreshToken ? refreshToken.substring(0, 20) + "..." : "없음"
    );

    // 현재 방 정보도 함께 조회해서 roomId 확인
    try {
      const roomResponse = await http.get("/molbbang/me");
      console.log("🔍 [Fetcher] 현재 방 정보:", roomResponse.data);

      // 방 정보에서 roomId와 멤버 정보 확인
      if (roomResponse.data && roomResponse.data.roomId) {
        console.log("🔍 [Fetcher] 방 ID:", roomResponse.data.roomId);
        console.log(
          "🔍 [Fetcher] 멤버 수:",
          roomResponse.data.members?.length || 0
        );
        console.log("🔍 [Fetcher] 멤버들:", roomResponse.data.members);

        // 멤버들의 is_active 상태 확인
        if (roomResponse.data.members) {
          roomResponse.data.members.forEach((member: any, index: number) => {
            console.log(`🔍 [Fetcher] 멤버 ${index + 1}:`, {
              nickname: member.nickname,
              userId: member.userId,
              active: member.active, // isActive → active로 변경
              ready: member.ready,
              online: member.online,
              score: member.score,
              total: member.total,
            });
          });
        }

        // 쿼리 디버깅을 위한 정보 수집
        console.log("🔍 [Fetcher] 쿼리 디버깅 정보:");
        console.log("  - roomId:", roomResponse.data.roomId);
        console.log("  - status:", roomResponse.data.status);
        console.log("  - totalRounds:", roomResponse.data.totalRounds);
        console.log(
          "  - members with active=true:",
          roomResponse.data.members?.filter((m: any) => m.active).length || 0
        );
        console.log(
          "  - members with score > 0:",
          roomResponse.data.members?.filter((m: any) => m.score > 0).length || 0
        );
      }
    } catch (roomError: any) {
      console.log("🔍 [Fetcher] 방 정보 조회 실패:", roomError);
      console.log("🔍 [Fetcher] 방 정보 조회 실패 상세:", {
        message: roomError.message,
        response: roomError.response?.data,
        status: roomError.response?.status,
        statusText: roomError.response?.statusText,
      });
    }

    const response = await http.get<ResultsResponse>(
      MOLBBANG_ENDPOINTS.getResults
    );
    console.log("🔍 [Fetcher] getResults 응답:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ [Fetcher] getResults 오류:", error);
    console.error("❌ [Fetcher] getResults 오류 상세:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });
    throw handleMolbbangError(error);
  }
}
