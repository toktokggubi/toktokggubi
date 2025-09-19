import { useQuery } from "@tanstack/react-query";
import { fetchGifticonList } from "@/features/User/api/fetchers";
import { toGifticonVM } from "./adapter";
import type { Gifticon } from "./types";

export const gifticonKeys = {
  all: ["gifticons"] as const,
  list: () => [...gifticonKeys.all, "list"] as const,
};

export function useGifticonsQuery() {
  return useQuery({
    queryKey: gifticonKeys.list(),
    queryFn: async (): Promise<Gifticon[]> => {
      const list = await fetchGifticonList();
      return list.map(toGifticonVM);
    },
    staleTime: 60_000,
  });
}
