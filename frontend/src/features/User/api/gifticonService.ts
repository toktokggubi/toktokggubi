import { http } from "@/shared/api/http";
import * as SecureStore from "expo-secure-store";
import * as FileSystem from "expo-file-system";

/** content:// 를 file:// 로 안전 변환 */
async function ensureFileUri(localUri: string) {
  if (localUri.startsWith("content://")) {
    const ext = localUri.toLowerCase().includes(".png") ? "png" :
                localUri.toLowerCase().includes(".webp") ? "webp" : "jpg";
    const dest = `${FileSystem.cacheDirectory}gifticon.${ext}`;
    await FileSystem.copyAsync({ from: localUri, to: dest });
    return dest; // file://...
  }
  return localUri; // 이미 file:// 이면 그대로 사용
}

/** MIME 추정 */
function guessMime(uri: string) {
  const u = uri.toLowerCase();
  if (u.endsWith(".png")) return "image/png";
  if (u.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

/** 기프티콘 이미지 업로드 + OCR + 저장 */
export async function uploadGifticon(localUri: string) {
  try {
    console.log("이미지 업로드 시작:", localUri);

    // 연결 테스트 제거 - OCR 처리 시간 단축

    // 2) URI 정리
    const fileUri = await ensureFileUri(localUri);
    const mime = guessMime(fileUri);
    const filename = `gifticon.${mime.split("/")[1]}`;

    // 파일 접근 테스트
    const info = await FileSystem.getInfoAsync(localUri);
    console.log("원본 URI 존재?", info.exists, info.exists ? (info as any).size : 0);
    
    const copied = await FileSystem.getInfoAsync(fileUri);
    console.log("전송 URI 존재?", copied.exists, copied.exists ? (copied as any).size : 0, fileUri);

    // 3) FormData (중요: Blob 쓰지 말고 파일 객체로!)
    const form = new FormData();
    form.append("file", {
      uri: fileUri,
      name: filename,
      type: mime,
    } as any);

    console.log("FormData 준비 완료", { fileUri, mime, filename });

    // 4) 전송: fetch 먼저(헤더 수동 설정 금지), 실패 시 axios 백업
    const token = await SecureStore.getItemAsync("access_token");
    const uploadUrl = "https://j13b207.p.ssafy.io/api/wallet/gifticons";

    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token ?? ""}`,
          // ⚠️ Content-Type 넣지 마세요! (boundary 자동)
        },
        body: form,
      });

      const text = await response.text(); // 디버깅용
      if (!response.ok) {
        console.error("fetch 응답 본문:", text);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      console.log("API 응답 성공(fetch):", text);
      return JSON.parse(text);
    } catch (fetchErr) {
      console.warn("fetch 실패, axios로 재시도:", fetchErr);

      // axios로 같은 FormData 재사용
      const res = await http.post("/wallet/gifticons", form, {
        // ⚠️ headers 비워두기 (axios가 RN에서 boundary 자동 세팅)
        timeout: 120_000, // 2분으로 증가 (OCR 처리 시간 고려)
      });
      console.log("API 응답 성공(axios):", res.data);
      return res.data;
    }
  } catch (error) {
    console.error("uploadGifticon 에러:", error);
    throw error;
  }
}

/** 기프티콘 삭제 */
export async function deleteGifticon(gifticonId: number): Promise<void> {
  try {
    console.log("기프티콘 삭제 시작:", gifticonId);
    
    await http.delete(`/wallet/gifticons/${gifticonId}`);
    
    console.log("기프티콘 삭제 성공:", gifticonId);
  } catch (error) {
    console.error("deleteGifticon 에러:", error);
    throw error;
  }
}
