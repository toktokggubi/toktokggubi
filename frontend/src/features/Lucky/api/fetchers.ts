import { http } from "@/shared/api/http";
import { MOLBBANG_ENDPOINTS } from "./endpoints";
import { handleMolbbangError } from "./errors";
import type {
  CreateRoomRequest,
  CreateRoomResponse,
  JoinRoomRequest,
  OkResponse,
  ReadyRequest,
  ResultsResponse,
  RoomView,
  RoundTransitionResponse,
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
  } catch (error) {
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
  } catch (error) {
    throw handleMolbbangError(error);
  }
}

// ===== 내 방 정보 조회 =====
export async function getMyRoom(): Promise<RoomView> {
  try {
    const response = await http.get<RoomView>(MOLBBANG_ENDPOINTS.myRoom);
    return response.data;
  } catch (error) {
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
  } catch (error) {
    throw handleMolbbangError(error);
  }
}

// ===== 방 나가기 =====
export async function leaveRoom(): Promise<OkResponse> {
  try {
    const response = await http.patch<OkResponse>(MOLBBANG_ENDPOINTS.leaveRoom);
    return response.data;
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    throw handleMolbbangError(error);
  }
}

// ===== 라운드 종료 =====
export async function endRound(): Promise<RoundTransitionResponse> {
  try {
    const response = await http.post<RoundTransitionResponse>(
      MOLBBANG_ENDPOINTS.endRound
    );
    return response.data;
  } catch (error) {
    throw handleMolbbangError(error);
  }
}

// ===== 최종 결과 조회 =====
export async function getResults(): Promise<ResultsResponse> {
  try {
    const response = await http.get<ResultsResponse>(
      MOLBBANG_ENDPOINTS.getResults
    );
    return response.data;
  } catch (error) {
    throw handleMolbbangError(error);
  }
}
