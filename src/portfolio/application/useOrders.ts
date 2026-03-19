import { useQuery } from "@tanstack/react-query";
import { portfolioHttpRepository } from "@/portfolio/infrastructure/portfolio.http-repository";

export const ordersQueryOptions = {
  queryKey: ["orders"] as const,
  queryFn: () => portfolioHttpRepository.getOrders(),
};

export function useOrders() {
  return useQuery(ordersQueryOptions);
}
