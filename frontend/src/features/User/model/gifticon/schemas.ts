import { z } from "zod";

// 🔹 목록 조회: 서버 도메인 모델
export const GifticonServerSchema = z.object({
  gifticonId: z.number(),
  label: z.string(),
  franchiseId: z.number().nullable(),
  franchiseName: z.string().nullable(),
  imageUrl: z.string(),
  expiresAt: z.string(), // "YYYY-MM-DD"
  daysUntilExpire: z.number(),
  status: z.enum(["ACTIVE", "USED", "EXPIRED"]),
});
export type GifticonServer = z.infer<typeof GifticonServerSchema>;

// 🔹 API 응답 래퍼
export const GifticonListResponseSchema = z.object({
  items: z.array(GifticonServerSchema),
});
export type GifticonListResponse = z.infer<typeof GifticonListResponseSchema>;

// 🔹 API 쿼리 파라미터
export interface GifticonListParams {
  franchiseId?: number;
  usable?: boolean;
  sort?: "latest" | "expires";
}

// 🔹 단건 생성(파일 업로드) 응답
export const GifticonCreateByFileSchema = GifticonServerSchema;
export type GifticonCreateByFile = z.infer<typeof GifticonCreateByFileSchema>;

// 🔹 OCR 미리보기 응답
export const GifticonPreviewSchema = z.object({
  merchant: z.string().optional(),
  label: z.string().optional(),
  expiresAt: z.string().optional(),
});
export type GifticonPreview = z.infer<typeof GifticonPreviewSchema>;

// 🔹 기프티콘 생성 응답
export const GifticonCreateResponseSchema = z.object({
  gifticonId: z.number(),
  message: z.string(),
});
export type GifticonCreateResponse = z.infer<typeof GifticonCreateResponseSchema>;
