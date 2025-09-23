import { useQuery } from "@tanstack/react-query";
import { fetchFranchiseList } from "@/features/User/api/fetchers";
import type { FranchiseServer } from "./schemas";
import type { FranchiseListParams } from "./schemas";

export const franchiseKeys = {
  all: ["franchises"] as const,
  list: (params?: FranchiseListParams) => [...franchiseKeys.all, "list", params] as const,
};

export function useFranchisesQuery(params?: FranchiseListParams) {
  return useQuery({
    queryKey: franchiseKeys.list(params),
    queryFn: async (): Promise<FranchiseServer[]> => {
      return await fetchFranchiseList(params);
    },
    staleTime: 5 * 60 * 1000, // 5분간 캐시 (프랜차이즈는 자주 변경되지 않음)
  });
}
