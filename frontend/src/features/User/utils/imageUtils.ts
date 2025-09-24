// frontend/src/features/User/utils/imageUtils.ts

const BASE_URL = "https://j13b207.p.ssafy.io";

/**
 * 서버에서 받은 이미지 URL을 절대 URL로 변환
 * @param imageUrlFromDB - DB에서 받은 이미지 URL (예: "/images/gifticon/xxx.jpg" 또는 "images/gifticon/xxx.jpg")
 * @returns 절대 URL (예: "https://j13b207.p.ssafy.io/images/gifticon/xxx.jpg")
 */
export function normalizeImageUrl(imageUrlFromDB: string): string {
  // 이미 절대 URL인 경우 그대로 반환
  if (imageUrlFromDB.startsWith("http://") || imageUrlFromDB.startsWith("https://")) {
    return imageUrlFromDB;
  }

  // 앞에 슬래시가 없으면 추가
  const normalizedPath = imageUrlFromDB.startsWith("/") 
    ? imageUrlFromDB 
    : `/${imageUrlFromDB}`;
  
  return `${BASE_URL}${normalizedPath}`;
}

/**
 * 이미지 로딩 에러를 처리하는 콜백
 */
export function handleImageError(uri: string, error?: any) {
  // 에러 처리 로직 (필요시 추가)
}

/**
 * 이미지 로딩 성공을 처리하는 콜백
 */
export function handleImageLoad(uri: string) {
  // 성공 처리 로직 (필요시 추가)
}
