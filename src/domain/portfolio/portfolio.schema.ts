import { z } from "zod";
import { CurrencySchema } from "../fund/fund.schema";

export const PortfolioItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number(),
  totalValue: z.object({
    amount: z.number(),
    currency: CurrencySchema,
  }),
});

export const PortfolioResponseSchema = z.object({
  data: z.array(PortfolioItemSchema),
});

export const PortfolioEntrySchema = z.object({
  id: z.string(),
  quantity: z.number(),
});

export const PortfolioActionResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    portfolio: z.array(PortfolioEntrySchema),
  }),
});

export type PortfolioItem = z.infer<typeof PortfolioItemSchema>;
export type PortfolioEntry = z.infer<typeof PortfolioEntrySchema>;
