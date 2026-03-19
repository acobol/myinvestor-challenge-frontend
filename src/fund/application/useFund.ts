import { useQuery } from "@tanstack/react-query";
import { fundHttpRepository } from "@/fund/infrastructure/fund.http-repository";

export function fundByIdQueryOptions(id: string) {
  return {
    queryKey: ["fund", id] as const,
    queryFn: () => fundHttpRepository.getFundById(id),
  };
}

export function useFund(id: string | null) {
  return useQuery({
    ...fundByIdQueryOptions(id ?? ""),
    enabled: !!id,
  });
}
