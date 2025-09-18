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
    staleTime: 0, // 캐시 시간을 0으로 설정하여 항상 새로고침
    refetchOnMount: true, // 마운트 시 강제 새로고침
    refetchOnWindowFocus: false, // 윈도우 포커스 시 새로고침 비활성화
  });
}
