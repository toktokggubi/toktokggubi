import {
  GifticonPreviewSchema,
  type GifticonPreview,
  GifticonCreateResponseSchema,
  type GifticonCreateResponse,
} from "@/features/User/model/gifticon/schemas";

/** 공용 요청 유틸 */
async function request<T>(
  url: string,
  init: RequestInit,
  parse: (v: unknown) => T
): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as unknown;
  return parse(json);
}

/** 로컬 파일 URI -> Blob */
async function uriToBlob(uri: string): Promise<Blob> {
  const res = await fetch(uri);
  // RN/Expo 환경에서도 fetch(uri)로 Blob 획득 가능
  return await res.blob();
}

/** 0) 파일 업로드: Blob 오버로드 사용 */
export async function uploadGifticonFile(
  localUri: string
): Promise<{ imageUrl: string }> {
  const form = new FormData();

  const blob = await uriToBlob(localUri);
  // 👇 타입 시그니처: append(name: string, blobValue: Blob, filename?: string)
  form.append("file", blob, "gifticon.jpg");

  const res = await fetch("/files/upload", {
    method: "POST",
    body: form,
    // ❌ Content-Type 수동 지정 금지 (boundary 포함 자동 세팅)
    // headers: { "Content-Type": "multipart/form-data" },
  });
  if (!res.ok) throw new Error("upload failed");
  return (await res.json()) as { imageUrl: string };
}

/** 1) 미리보기(텍스트 추출) */
export async function requestGifticonPreview(payload: {
  imageUrl: string;
}): Promise<GifticonPreview> {
  return request(
    "/wallet/gifticons/preview",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    (j) => GifticonPreviewSchema.parse(j)
  );
}

/** 2) 최종 저장 */
export async function createGifticon(payload: {
  imageUrl: string;
  merchant: string;
  label: string;
  expiresAt: string;
}): Promise<GifticonCreateResponse> {
  return request(
    "/wallet/gifticons",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    (j) => GifticonCreateResponseSchema.parse(j)
  );
}
