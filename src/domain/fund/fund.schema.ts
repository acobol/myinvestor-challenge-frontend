import { z } from 'zod'

export const CurrencySchema = z.enum(['USD', 'EUR'])

export const FundCategorySchema = z.enum(['GLOBAL', 'TECH', 'HEALTH', 'MONEY_MARKET'])

export const FundValueSchema = z.object({
  amount: z.number(),
  currency: CurrencySchema,
})

export const FundProfitabilitySchema = z.object({
  YTD: z.number(),
  oneYear: z.number(),
  threeYears: z.number(),
  fiveYears: z.number(),
})

export const FundSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  value: FundValueSchema,
  category: FundCategorySchema,
  profitability: FundProfitabilitySchema,
})

export const FundsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  sort: z
    .enum([
      'name:asc', 'name:desc',
      'currency:asc', 'currency:desc',
      'value:asc', 'value:desc',
      'category:asc', 'category:desc',
      'profitability.YTD:asc', 'profitability.YTD:desc',
      'profitability.oneYear:asc', 'profitability.oneYear:desc',
      'profitability.threeYears:asc', 'profitability.threeYears:desc',
      'profitability.fiveYears:asc', 'profitability.fiveYears:desc',
    ])
    .optional(),
})

export const FundsResponseSchema = z.object({
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    totalFunds: z.number(),
    totalPages: z.number(),
  }),
  data: z.array(FundSchema),
})

export const FundResponseSchema = z.object({
  data: FundSchema,
})

export const BuySellRequestSchema = z.object({
  quantity: z.number().positive(),
})

export const TransferRequestSchema = z.object({
  fromFundId: z.string(),
  toFundId: z.string(),
  quantity: z.number().positive(),
})

export type Currency = z.infer<typeof CurrencySchema>
export type FundCategory = z.infer<typeof FundCategorySchema>
export type Fund = z.infer<typeof FundSchema>
export type FundsQuery = z.infer<typeof FundsQuerySchema>
export type BuySellRequest = z.infer<typeof BuySellRequestSchema>
export type TransferRequest = z.infer<typeof TransferRequestSchema>
