import { useQuery } from "@tanstack/react-query";
import { getCardBenefits } from "@/features/User/api/benefitService";
import type { CardBenefitsResponse } from "@/features/User/model/benefit/types";

export const benefitQueryKeys = {
  root: ["cardBenefits"] as const,
  byCard: (userCardId: number) =>
    [...benefitQueryKeys.root, userCardId] as const,
};

export function useCardBenefits(userCardId: number) {
  return useQuery<CardBenefitsResponse>({
    queryKey: benefitQueryKeys.byCard(userCardId),
    queryFn: () => getCardBenefits(userCardId),
    enabled: Number.isFinite(userCardId) && userCardId > 0, // 카드 선택 전에는 호출 X
    staleTime: 1000 * 60, // 1m
  });
}
