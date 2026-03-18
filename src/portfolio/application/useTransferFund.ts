import { useMutation, useQueryClient } from "@tanstack/react-query";
import { portfolioHttpRepository } from "@/portfolio/infrastructure/portfolio.http-repository";
import { portfolioQueryOptions } from "./usePortfolio";

export function useTransferFund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      fromFundId,
      toFundId,
      quantity,
    }: {
      fromFundId: string;
      toFundId: string;
      quantity: number;
    }) => portfolioHttpRepository.transferFund(fromFundId, toFundId, quantity),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: portfolioQueryOptions.queryKey });
    },
  });
}
