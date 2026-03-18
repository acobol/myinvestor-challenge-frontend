import { useQuery } from "@tanstack/react-query";
import { portfolioHttpRepository } from "@/portfolio/infrastructure/portfolio.http-repository";

export const portfolioQueryOptions = {
  queryKey: ["portfolio"] as const,
  queryFn: () => portfolioHttpRepository.getPortfolio(),
};

export function usePortfolio() {
  return useQuery(portfolioQueryOptions);
}
