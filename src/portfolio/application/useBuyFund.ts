import { useMutation } from "@tanstack/react-query";
import { portfolioHttpRepository } from "@/portfolio/infrastructure/portfolio.http-repository";

export function useBuyFund() {
  return useMutation({
    mutationFn: ({ fundId, quantity }: { fundId: string; quantity: number }) =>
      portfolioHttpRepository.buyFund(fundId, quantity),
  });
}
