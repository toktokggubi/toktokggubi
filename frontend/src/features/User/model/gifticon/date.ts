// src/features/User/model/gifticon/date.ts
export function calcDDay(expiresAt: string | number | Date): number {
  let end: Date;
  if (expiresAt instanceof Date) {
    end = expiresAt;
  } else if (typeof expiresAt === "number") {
    // 초 단위일 가능성 대비 (10^12 미만이면 초로 보고 *1000)
    end = new Date(expiresAt < 1e12 ? expiresAt * 1000 : expiresAt);
  } else {
    // "YYYY-MM-DD" 같은 문자열
    end = new Date(expiresAt);
  }

  const today = new Date();
  const endDay = new Date(end); // 복사본
  const t0 = today.setHours(0, 0, 0, 0);
  const t1 = endDay.setHours(0, 0, 0, 0);
  return Math.floor((t1 - t0) / (1000 * 60 * 60 * 24));
}
