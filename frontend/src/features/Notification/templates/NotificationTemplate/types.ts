export interface NotificationItem {
  notificationId: number;
  type: NotificationType;
  title: string;
  body: string;
  sentAt: string;
  readAt: string | null;
}

export type NotificationType =
  | "THRESHOLD/CATEGORY"
  | "THRESHOLD/TOTAL"
  | "EXCEEDED/CATEGORY"
  | "EXCEEDED/TOTAL"
  | "LOCATION";

export interface NotificationListResponse {
  readFilter: "all" | "read" | "unread";
  limit: number;
  total: number;
  items: NotificationItem[];
}
