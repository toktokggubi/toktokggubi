import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchUserCards,
  fetchCardBenefits,
  type CardBenefitsResponse,
} from "@/features/User/api/wallet.fetchers";
import { mapCardToVM, type UserCardVM } from "./types";
import { cardQueryKeys } from "./queryKeys";

/** 카드 목록 */
export function useUserCards() {
  return useQuery<UserCardVM[]>({
    queryKey: cardQueryKeys.all,
    queryFn: async () => {
      const res = await fetchUserCards();
      return res.cards.map(mapCardToVM);
    },
    staleTime: 60_000,
  });
}

/** 카드 혜택 */
export function useCardBenefits(userCardId: number) {
  return useQuery<CardBenefitsResponse>({
    queryKey: cardQueryKeys.benefits(userCardId),
    queryFn: () => fetchCardBenefits(userCardId),
    enabled: Number.isFinite(userCardId) && userCardId > 0,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

/** 외부에서 ‘동기화’ 눌렀을 때 */
export function useRefetchUserCards() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: cardQueryKeys.all });
}
