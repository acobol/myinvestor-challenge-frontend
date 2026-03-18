import type { Currency } from "@/shared/domain/currency";
import { EUR_USD_RATE } from "@/shared/domain/currency";

/** Converts any supported currency amount to EUR. */
export function toEur(amount: number, currency: Currency): number {
  return currency === "USD" ? amount / EUR_USD_RATE : amount;
}
