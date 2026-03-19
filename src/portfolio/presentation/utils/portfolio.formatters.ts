export { toEur } from "@/shared/application/currency.utils";

/** Formats a benefit/gain amount with mandatory sign display (+/-). */
export function formatBenefit(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    signDisplay: "exceptZero",
  }).format(amount);
}
