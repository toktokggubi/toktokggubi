import type { Gifticon } from "./types";
import type { GifticonServer } from "./schemas";
import { calcDDay } from "./date";

function fallback<T>(v: T | null | undefined, alt: T): T {
  return v ?? alt;
}

/** 서버 → 화면용 VM */
export function toGifticonVM(s: GifticonServer): Gifticon {
  const merchantName = fallback(s.brandName, s.franchiseName ?? "알수없음");
  const categoryName = "미분류"; // 서버에 카테고리 없으므로 임시 라벨
  const remainingDays = calcDDay(s.expiresAt);

  return {
    gifticonId: s.gifticonId,
    label: s.label,
    merchantName,
    categoryName,
    expiresAt: s.expiresAt,
    remainingDays,
    status: s.status,
    // dummy에는 imageKey가 있었지만 서버는 imageUrl이므로 임시 키 생성
    imageKey: "server", // Grid에서 resolveAssetSource 대신 imageUrl로 그릴 계획이면 UI 수정 필요
    createdAt: s.createdAt ?? undefined,
  };
}
