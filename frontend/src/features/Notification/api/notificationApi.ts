// 알림 관련 API 함수들
import type { NotificationListResponse } from "../templates/NotificationTemplate/types";

// 알림 목록 조회
export const fetchNotifications =
  async (): Promise<NotificationListResponse> => {
    try {
      const response = await fetch("/ai/notification", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("알림 목록 조회 실패:", error);
      // 에러 시 빈 응답 반환
      return {
        readFilter: "all",
        limit: 20,
        total: 0,
        items: [],
      };
    }
  };

// 알림 읽음 처리
export const markNotificationsAsRead = async (): Promise<{
  updatedCount: number;
}> => {
  try {
    const response = await fetch("/ai/notification/read", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("알림 읽음 처리 실패:", error);
    return { updatedCount: 0 };
  }
};

// 이번 달 알림 삭제
export const deleteNotifications = async (): Promise<{
  deleted: number;
}> => {
  try {
    const response = await fetch("/ai/notification", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("알림 삭제 실패:", error);
    return { deleted: 0 };
  }
};
