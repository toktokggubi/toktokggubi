import { z } from "zod";

// 🔹 목록 조회: 서버 도메인 모델
export const GifticonServerSchema = z.object({
  gifticonId: z.number(),
  label: z.string(),
  brandName: z.string().optional().nullable(), // 서버 명세에 brandName 존재
  franchiseId: z.number().optional().nullable(),
  franchiseName: z.string().optional().nullable(),
  expiresAt: z.string(), // "YYYY-MM-DD"
  imageUrl: z.string().url().optional().nullable(),
  status: z.enum(["ACTIVE", "USED", "EXPIRED"]),
  ocrPreview: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
});
export type GifticonServer = z.infer<typeof GifticonServerSchema>;

export const GifticonListSchema = z.array(GifticonServerSchema);

// 🔹 단건 생성(파일 업로드) 응답
export const GifticonCreateByFileSchema = GifticonServerSchema;
export type GifticonCreateByFile = z.infer<typeof GifticonCreateByFileSchema>;

/* 이미 있던 프리뷰/생성 스키마는 그대로 두어도 되고,
   서버 명세에 맞춰 위 스키마들로 통일해도 OK */
