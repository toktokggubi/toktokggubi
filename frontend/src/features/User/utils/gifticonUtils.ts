// frontend/src/features/User/utils/gifticonUtils.ts

/**
 * 기프티콘이 만료되었는지 확인
 * @param expiresAt - 만료일 (ISO date string)
 * @returns 만료 여부
 */
export function isGifticonExpired(expiresAt: string): boolean {
  const today = new Date();
  const expireDate = new Date(expiresAt);
  
  // 시간을 00:00:00으로 설정하여 날짜만 비교
  today.setHours(0, 0, 0, 0);
  expireDate.setHours(0, 0, 0, 0);
  
  return today > expireDate;
}

/**
 * 기프티콘의 D-Day 계산 (만료된 경우 null 반환)
 * @param expiresAt - 만료일 (ISO date string)
 * @returns D-Day 숫자 또는 null (만료된 경우)
 */
export function calculateDDay(expiresAt: string): number | null {
  if (isGifticonExpired(expiresAt)) {
    return null; // 만료된 경우 null 반환
  }
  
  const today = new Date();
  const expireDate = new Date(expiresAt);
  
  // 시간을 00:00:00으로 설정하여 날짜만 비교
  today.setHours(0, 0, 0, 0);
  expireDate.setHours(0, 0, 0, 0);
  
  const diffTime = expireDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}
