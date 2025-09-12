export type GifticonStatus = "ACTIVE" | "USED" | "EXPIRED";

export interface Gifticon {
  gifticonId: number;
  label: string;
  merchantName: string;
  categoryName: string;
  expiresAt: string; // ISO date
  remainingDays: number;
  status: GifticonStatus;
  // 로컬 더미 전용 필드(이미지 소스 키)
  imageKey: string;
  createdAt?: string;
}
