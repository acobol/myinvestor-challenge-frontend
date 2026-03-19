import { z } from "zod";
import { CurrencySchema } from "@/shared/domain/currency";

export const ORDER_TYPES = ["BUY", "SELL", "TRANSFER"] as const;

export const OrderTypeSchema = z.enum(ORDER_TYPES);
export type OrderType = z.infer<typeof OrderTypeSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  type: OrderTypeSchema,
  date: z.string(),
  fundId: z.string(),
  fundName: z.string(),
  quantity: z.number(),
  pricePerUnit: z.number(),
  currency: CurrencySchema,
  amountEur: z.number().optional(),
  toFundId: z.string().optional(),
  toFundName: z.string().optional(),
});

export const OrdersResponseSchema = z.object({
  data: z.array(OrderSchema),
});

export type Order = z.infer<typeof OrderSchema>;
