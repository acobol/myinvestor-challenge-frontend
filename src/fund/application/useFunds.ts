import { useQuery } from "@tanstack/react-query";
import { FundsQuerySchema } from "@/fund/domain/fund.schema";
import type { FundsQuery } from "@/fund/domain/fund.schema";
import type { FundRepository } from "@/fund/domain/fund.port";
import { fundHttpRepository } from "@/fund/infrastructure/fund.http-repository";

export const FUNDS_QUERY_KEY = "funds";

export function fundsQueryOptions(
  query: Partial<FundsQuery>,
  repository: FundRepository = fundHttpRepository,
) {
  const parsed = FundsQuerySchema.parse(query);
  return {
    queryKey: [FUNDS_QUERY_KEY, parsed] as const,
    queryFn: () => repository.getFunds(parsed),
  };
}

export function useFunds(
  query: Partial<FundsQuery> = {},
  repository: FundRepository = fundHttpRepository,
) {
  return useQuery(fundsQueryOptions(query, repository));
}
