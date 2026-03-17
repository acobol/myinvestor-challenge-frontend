export const CURRENCIES = ["USD", "EUR"] as const;

/** Fixed EUR/USD exchange rate used for currency conversion in fund purchases. */
export const EUR_USD_RATE = 1.08;

export const FUND_CATEGORIES = [
  "GLOBAL",
  "TECH",
  "HEALTH",
  "MONEY_MARKET",
] as const;

export const FUND_SORT_OPTIONS = [
  "name:asc",
  "name:desc",
  "currency:asc",
  "currency:desc",
  "value:asc",
  "value:desc",
  "category:asc",
  "category:desc",
  "profitability.YTD:asc",
  "profitability.YTD:desc",
  "profitability.oneYear:asc",
  "profitability.oneYear:desc",
  "profitability.threeYears:asc",
  "profitability.threeYears:desc",
  "profitability.fiveYears:asc",
  "profitability.fiveYears:desc",
] as const;

export type Currency = (typeof CURRENCIES)[number];
export type FundCategory = (typeof FUND_CATEGORIES)[number];
export type FundSortOption = (typeof FUND_SORT_OPTIONS)[number];
