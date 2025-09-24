export const GIFTICON_ENDPOINTS = {
  list: "/wallet/gifticons", // GET: 내 기프티콘 목록 조회
  createByFile: "/wallet/gifticons", // POST multipart/form-data: file
  preview: "/wallet/gifticons/preview", // (옵션) 이미지 URL로 OCR 프리뷰
  // 필요 시: "/files/upload" 같은 공용 업로드는 shared 쪽을 사용
} as const;

export const FRANCHISE_ENDPOINTS = {
  list: "/franchises", // GET: 프랜차이즈 목록 조회
} as const;