import type { Gifticon } from "./types";
import type { GifticonServer } from "./schemas";
import { calcDDay } from "./date";

function fallback<T>(v: T | null | undefined, alt: T): T {
  return v ?? alt;
}

/** 서버 → 화면용 VM */
export function toGifticonVM(s: GifticonServer): Gifticon {
  const merchantName = s.franchiseName;
  const categoryName = "미분류"; // 서버에 카테고리 없으므로 임시 라벨
  const remainingDays = s.daysUntilExpire;

  return {
    gifticonId: s.gifticonId,
    label: s.label,
    merchantName,
    categoryName,
    expiresAt: s.expiresAt,
    remainingDays,
    status: s.status,
    // 서버에서 제공하는 imageUrl을 사용
    imageKey: s.imageUrl,
    createdAt: undefined, // 서버에서 createdAt을 제공하지 않음
  };
}
