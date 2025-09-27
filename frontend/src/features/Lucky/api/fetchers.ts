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
    const response = await http.post<GameEndResponse>(
      MOLBBANG_ENDPOINTS.endGame
    );
    return response.data;
  } catch (error: any) {
    throw handleMolbbangError(error);
  }
}

// ===== 최종 결과 조회 =====
export async function getResults(): Promise<ResultsResponse> {
  try {

    // 토큰 확인
    const token = await SecureStore.getItemAsync("access_token");
    const refreshToken = await SecureStore.getItemAsync("refresh_token");

    // 현재 방 정보도 함께 조회해서 roomId 확인
    try {
      const roomResponse = await http.get("/molbbang/me");

      // 방 정보에서 roomId와 멤버 정보 확인
      if (roomResponse.data && roomResponse.data.roomId) {

        // 멤버들의 is_active 상태 확인
        if (roomResponse.data.members) {
          roomResponse.data.members.forEach((member: any, index: number) => {
          });
        }

        // 쿼리 디버깅을 위한 정보 수집
      }
    } catch (roomError: any) {
    }

    const response = await http.get<ResultsResponse>(
      MOLBBANG_ENDPOINTS.getResults
    );
    return response.data;
  } catch (error: any) {
    throw handleMolbbangError(error);
  }
}
