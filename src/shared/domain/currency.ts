import { z } from "zod";

export const CURRENCIES = ["USD", "EUR"] as const;
export type Currency = (typeof CURRENCIES)[number];

/** Fixed EUR/USD exchange rate used for currency conversion across the app. */
export const EUR_USD_RATE = 1.08;

export const CurrencySchema = z.enum(CURRENCIES);
