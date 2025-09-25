// 몰빵게임 관련 에러 타입 정의
export class MolbbangError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "MolbbangError";
  }
}

// 에러 코드 상수
export const MOLBBANG_ERROR_CODES = {
  ROOM_NOT_FOUND: "ROOM_NOT_FOUND",
  ROOM_FULL: "ROOM_FULL",
  NOT_READY: "NOT_READY",
  NOT_ENOUGH_MEMBERS: "NOT_ENOUGH_MEMBERS",
  NOT_HOST: "NOT_HOST",
  ALREADY_SUBMITTED: "ALREADY_SUBMITTED",
  GAME_CLOSED: "GAME_CLOSED",
  INVALID_CODE: "INVALID_CODE",
  NICKNAME_TAKEN: "NICKNAME_TAKEN",
  ALREADY_IN_ROOM: "ALREADY_IN_ROOM",
} as const;

export type MolbbangErrorCode =
  (typeof MOLBBANG_ERROR_CODES)[keyof typeof MOLBBANG_ERROR_CODES];

// 에러 메시지 매핑
export const ERROR_MESSAGES: Record<MolbbangErrorCode, string> = {
  [MOLBBANG_ERROR_CODES.ROOM_NOT_FOUND]: "방을 찾을 수 없습니다.",
  [MOLBBANG_ERROR_CODES.ROOM_FULL]: "방이 가득 찼습니다.",
  [MOLBBANG_ERROR_CODES.NOT_READY]: "모든 멤버가 준비되지 않았습니다.",
  [MOLBBANG_ERROR_CODES.NOT_ENOUGH_MEMBERS]: "최소 2명 이상이 필요합니다.",
  [MOLBBANG_ERROR_CODES.NOT_HOST]: "방장만 할 수 있습니다.",
  [MOLBBANG_ERROR_CODES.ALREADY_SUBMITTED]: "이미 점수를 제출했습니다.",
  [MOLBBANG_ERROR_CODES.GAME_CLOSED]: "게임이 종료되었습니다.",
  [MOLBBANG_ERROR_CODES.INVALID_CODE]: "잘못된 방 코드입니다.",
  [MOLBBANG_ERROR_CODES.NICKNAME_TAKEN]: "이미 사용 중인 닉네임입니다.",
  [MOLBBANG_ERROR_CODES.ALREADY_IN_ROOM]: "이미 다른 방에 참여 중입니다.",
};

// HTTP 상태 코드별 에러 처리
export function handleMolbbangError(error: any): MolbbangError {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        if (data?.message?.includes("not_ready")) {
          return new MolbbangError(
            ERROR_MESSAGES[MOLBBANG_ERROR_CODES.NOT_READY],
            MOLBBANG_ERROR_CODES.NOT_READY,
            status
          );
        }
        if (data?.message?.includes("not_enough_members")) {
          return new MolbbangError(
            ERROR_MESSAGES[MOLBBANG_ERROR_CODES.NOT_ENOUGH_MEMBERS],
            MOLBBANG_ERROR_CODES.NOT_ENOUGH_MEMBERS,
            status
          );
        }
        if (data?.message?.includes("already_submitted")) {
          return new MolbbangError(
            ERROR_MESSAGES[MOLBBANG_ERROR_CODES.ALREADY_SUBMITTED],
            MOLBBANG_ERROR_CODES.ALREADY_SUBMITTED,
            status
          );
        }
        break;
      case 403:
        if (data?.message?.includes("호스트만")) {
          return new MolbbangError(
            ERROR_MESSAGES[MOLBBANG_ERROR_CODES.NOT_HOST],
            MOLBBANG_ERROR_CODES.NOT_HOST,
            status
          );
        }
        break;
      case 401:
        if (
          data?.message?.includes("expired") ||
          data?.message?.includes("invalid")
        ) {
          return new MolbbangError(
            "토큰이 만료되었습니다. 다시 로그인해주세요.",
            "TOKEN_EXPIRED",
            status
          );
        }
        return new MolbbangError(
          "인증이 필요합니다. 다시 로그인해주세요.",
          "UNAUTHORIZED",
          status
        );
      case 404:
        return new MolbbangError(
          ERROR_MESSAGES[MOLBBANG_ERROR_CODES.ROOM_NOT_FOUND],
          MOLBBANG_ERROR_CODES.ROOM_NOT_FOUND,
          status
        );
      case 409:
        if (data?.message?.includes("닉네임")) {
          return new MolbbangError(
            ERROR_MESSAGES[MOLBBANG_ERROR_CODES.NICKNAME_TAKEN],
            MOLBBANG_ERROR_CODES.NICKNAME_TAKEN,
            status
          );
        }
        if (data?.message?.includes("이미 다른 방")) {
          return new MolbbangError(
            ERROR_MESSAGES[MOLBBANG_ERROR_CODES.ALREADY_IN_ROOM],
            MOLBBANG_ERROR_CODES.ALREADY_IN_ROOM,
            status
          );
        }
        break;
    }
  }

  // 기본 에러
  return new MolbbangError(
    "알 수 없는 오류가 발생했습니다.",
    "UNKNOWN_ERROR",
    error.response?.status
  );
}
