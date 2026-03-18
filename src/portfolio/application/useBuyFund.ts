import { useMutation, useQueryClient } from "@tanstack/react-query";
import { portfolioHttpRepository } from "@/portfolio/infrastructure/portfolio.http-repository";
import { portfolioQueryOptions } from "./usePortfolio";

export function useBuyFund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fundId, quantity }: { fundId: string; quantity: number }) =>
      portfolioHttpRepository.buyFund(fundId, quantity),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: portfolioQueryOptions.queryKey });
    },
  });
}
