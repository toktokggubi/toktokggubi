// 알림 관련 API 함수들
import type {
  NotificationItem,
  NotificationListResponse,
} from "../templates/NotificationTemplate/types";
import { http } from "@/shared/api/http";

// 알림 목록 조회
export const fetchNotifications =
  async (): Promise<NotificationListResponse> => {
    try {
      const response = await http.get('/ai/notification');
      return response.data;
    } catch (error) {
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
    const response = await http.patch('/ai/notification/read');
    return response.data;
    } catch (error) {
      return { updatedCount: 0 };
  }
};

// 이번 달 알림 삭제
export const deleteNotifications = async (): Promise<{
  deleted: number;
}> => {
  try {
    const response = await http.delete('/ai/notification/');
    return response.data;
    } catch (error) {
      return { deleted: 0 };
  }
};
