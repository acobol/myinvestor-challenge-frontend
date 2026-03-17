import type { Fund } from "@/fund/domain/fund.schema";
import { EUR_USD_RATE } from "@/fund/domain/fund.constants";

/**
 * Converts a EUR amount to the number of fund units the user would receive.
 * Applies EUR→USD conversion when the fund is denominated in USD.
 */
export function calculateQuantity(amountEur: number, fund: Fund): number {
  if (fund.value.amount === 0) return 0;
  const amountInFundCurrency =
    fund.value.currency === "USD" ? amountEur * EUR_USD_RATE : amountEur;
  return amountInFundCurrency / fund.value.amount;
}
