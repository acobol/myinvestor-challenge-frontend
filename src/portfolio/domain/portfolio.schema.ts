import { z } from "zod";
import { FundCategorySchema, FundProfitabilitySchema, FundValueSchema } from "@/fund/domain/fund.schema";
import { CurrencySchema } from "@/shared/domain/currency";

export const PortfolioItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number(),
  totalValue: z.object({
    amount: z.number(),
    currency: CurrencySchema,
  }),
});

/** Portfolio item enriched with fund metadata (category, symbol, value, profitability). */
export const PortfolioPositionSchema = PortfolioItemSchema.extend({
  symbol: z.string(),
  category: FundCategorySchema,
  value: FundValueSchema,
  profitability: FundProfitabilitySchema,
});

export const PortfolioResponseSchema = z.object({
  data: z.array(PortfolioPositionSchema),
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
export type PortfolioPosition = z.infer<typeof PortfolioPositionSchema>;
export type PortfolioEntry = z.infer<typeof PortfolioEntrySchema>;
