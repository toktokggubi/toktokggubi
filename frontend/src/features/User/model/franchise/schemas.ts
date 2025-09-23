import { z } from "zod";

// 🔹 프랜차이즈 서버 모델
export const FranchiseServerSchema = z.object({
  franchiseId: z.number(),
  merchantName: z.string(),
  imageUrl: z.string().optional().nullable(),
});
export type FranchiseServer = z.infer<typeof FranchiseServerSchema>;

// 🔹 프랜차이즈 목록 응답
export const FranchiseListResponseSchema = z.array(FranchiseServerSchema);
export type FranchiseListResponse = z.infer<typeof FranchiseListResponseSchema>;

// 🔹 프랜차이즈 쿼리 파라미터
export interface FranchiseListParams {
  q?: string; // 검색어
  sort?: "name"; // 정렬 (기본값: name)
}
