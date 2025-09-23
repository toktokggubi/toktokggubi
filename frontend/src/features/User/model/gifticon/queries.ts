import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchGifticonList } from "@/features/User/api/fetchers";
import { toGifticonVM } from "./adapter";
import type { Gifticon } from "./types";
import type { GifticonListParams } from "./schemas";

export const gifticonKeys = {
  all: ["gifticons"] as const,
  list: (params?: GifticonListParams) => [...gifticonKeys.all, "list", params] as const,
};

export function useGifticonsQuery(params?: GifticonListParams) {
  return useQuery({
    queryKey: gifticonKeys.list(params),
    queryFn: async (): Promise<Gifticon[]> => {
      const response = await fetchGifticonList(params);
      return response.items.map(toGifticonVM);
    },
    staleTime: 30_000, // 30초로 단축 (더 빠른 업데이트)
  });
}

/** 기프티콘 캐시 무효화 훅 */
export function useInvalidateGifticons() {
  const queryClient = useQueryClient();
  
  return () => {
    // 모든 기프티콘 관련 쿼리 무효화
    queryClient.invalidateQueries({ queryKey: gifticonKeys.all });
  };
}
