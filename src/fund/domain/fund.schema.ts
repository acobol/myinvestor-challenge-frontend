import { z } from "zod";
import {
  CURRENCIES,
  FUND_CATEGORIES,
  FUND_SORT_OPTIONS,
} from "./fund.constants";

export const CurrencySchema = z.enum(CURRENCIES);

export const FundCategorySchema = z.enum(FUND_CATEGORIES);

export const FundValueSchema = z.object({
  amount: z.number(),
  currency: CurrencySchema,
});

export const FundProfitabilitySchema = z.object({
  YTD: z.number(),
  oneYear: z.number(),
  threeYears: z.number(),
  fiveYears: z.number(),
});

export const FundSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  value: FundValueSchema,
  category: FundCategorySchema,
  profitability: FundProfitabilitySchema,
});

export const FundsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  sort: z.enum(FUND_SORT_OPTIONS).optional(),
});

export const FundsResponseSchema = z.object({
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    totalFunds: z.number(),
    totalPages: z.number(),
  }),
  data: z.array(FundSchema),
});

export const FundResponseSchema = z.object({
  data: FundSchema,
});

export const BuySellRequestSchema = z.object({
  quantity: z.number().positive(),
});

export const TransferRequestSchema = z.object({
  fromFundId: z.string(),
  toFundId: z.string(),
  quantity: z.number().positive(),
});

export type Fund = z.infer<typeof FundSchema>;
export type FundsQuery = z.infer<typeof FundsQuerySchema>;
export type FundsResponse = z.infer<typeof FundsResponseSchema>;
export type BuySellRequest = z.infer<typeof BuySellRequestSchema>;
export type TransferRequest = z.infer<typeof TransferRequestSchema>;

// Re-export constants types for convenience
export type { Currency, FundCategory, FundSortOption } from "./fund.constants";
