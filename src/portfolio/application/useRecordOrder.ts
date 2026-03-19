import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { orderIdbRepository } from "@/portfolio/infrastructure/order.idb-repository";
import type { Order } from "@/portfolio/domain/order.schema";
import { ordersQueryOptions } from "./useOrders";

export function useRecordOrder() {
  const queryClient = useQueryClient();

  return useCallback(
    async (order: Omit<Order, "id" | "date">) => {
      await orderIdbRepository.addOrder(order);
      void queryClient.invalidateQueries({ queryKey: ordersQueryOptions.queryKey });
    },
    [queryClient],
  );
}
