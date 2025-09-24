import { http } from "@/shared/api/http";
import { GIFTICON_ENDPOINTS, FRANCHISE_ENDPOINTS } from "./endpoints";
import {
  GifticonListResponseSchema,
  GifticonCreateByFileSchema,
  type GifticonServer,
  type GifticonListParams,
} from "@/features/User/model/gifticon/schemas";
import {
  FranchiseListResponseSchema,
  type FranchiseServer,
  type FranchiseListParams,
} from "@/features/User/model/franchise/schemas";

/** 1) 목록 조회 */
export async function fetchGifticonList(params?: GifticonListParams) {
  const { data } = await http.get(GIFTICON_ENDPOINTS.list, { params });
  return GifticonListResponseSchema.parse(data); // { items: GifticonServer[] }
}

/** 2) 파일로 등록 (POST /wallet/gifticons, multipart/form-data) */
export interface GifticonFileCreateReq {
  file: Blob; // Expo 환경이면 File-like Blob (uri→blob 변환 가능)
  filename?: string;
}
export async function createGifticonByFile(req: GifticonFileCreateReq) {
  const form = new FormData();
  form.append("file", req.file, req.filename ?? "gifticon.jpg");

  const { data } = await http.post(GIFTICON_ENDPOINTS.createByFile, form, {
    headers: {
      // axios는 FormData면 boundary 자동 설정. 명시 불필요.
      // Authorization 헤더는 http 인터셉터(토큰)로 공통 처리
    },
  });
  return GifticonCreateByFileSchema.parse(data); // GifticonServer
}

/** (옵션) URL 기반 OCR 프리뷰가 필요하면 */
export async function previewGifticon(payload: { imageUrl: string }) {
  const { data } = await http.post(GIFTICON_ENDPOINTS.preview, payload);
  // 프리뷰는 기존 GifticonPreviewSchema 재사용
  // 서버 스펙에 따라 필요 시 스키마 조정
  return data;
}

/** 프랜차이즈 목록 조회 */
export async function fetchFranchiseList(params?: FranchiseListParams) {
  const { data } = await http.get(FRANCHISE_ENDPOINTS.list, { params });
  return FranchiseListResponseSchema.parse(data); // FranchiseServer[]
}
