// 알림 관련 API 함수들
import type {
  NotificationItem,
  NotificationListResponse,
} from "../templates/NotificationTemplate/types";

// 목업 데이터를 위한 전역 상태 (실제로는 서버에서 관리)
let mockNotifications: NotificationItem[] = [];
let isInitialized = false; // 초기화 여부를 추적
let isDeleted = false; // 삭제 여부를 추적

// 알림 목록 조회
export const fetchNotifications =
  async (): Promise<NotificationListResponse> => {
    // TODO: 실제 API 연동 시 구현
    // const response = await fetch('/ai/notification/list');
    // return response.json();

    // 삭제된 상태라면 빈 배열 반환
    if (isDeleted) {
      return {
        readFilter: "all",
        limit: 20,
        total: 0,
        items: [],
      };
    }

    // 목업 데이터 초기화 (첫 호출 시에만)
    if (!isInitialized) {
      const { mockNotificationData } = await import("../data/mockData");
      mockNotifications = [...mockNotificationData.items];
      isInitialized = true;
    }
    return {
      readFilter: "all",
      limit: 20,
      total: mockNotifications.length,
      items: mockNotifications,
    };
  };

// 알림 읽음 처리
export const markNotificationsAsRead = async (): Promise<{
  updatedCount: number;
}> => {
  // TODO: 실제 API 연동 시 구현
  // const response = await fetch('/ai/notification/read', {
  //   method: 'PATCH',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ updatedCount: 0 })
  // });
  // return response.json();

  // 목업: 읽지 않은 알림들을 읽음 처리
  const unreadCount = mockNotifications.filter(
    (notification) => notification.readAt === null
  ).length;

  if (unreadCount > 0) {
    const now = new Date().toISOString();
    mockNotifications = mockNotifications.map((notification) => ({
      ...notification,
      readAt: notification.readAt === null ? now : notification.readAt,
    }));
  }

  return { updatedCount: unreadCount };
};

// 이번 달 알림 삭제
export const deleteNotifications = async (): Promise<{
  deleted: number;
}> => {
  // TODO: 실제 API 연동 시 구현
  // const response = await fetch('/ai/notification/', {
  //   method: 'DELETE',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ deleted: 0 })
  // });
  // return response.json();

  // 목업: 모든 알림 삭제
  const deletedCount = mockNotifications.length;
  mockNotifications = [];
  isDeleted = true; // 삭제 상태로 설정

  return { deleted: deletedCount };
};
