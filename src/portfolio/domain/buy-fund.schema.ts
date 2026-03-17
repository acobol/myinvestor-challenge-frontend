import { z } from "zod";

export const BuyFormSchema = z.object({
  /** Amount the user wants to invest, always in EUR, max 10 000 €. */
  amountEur: z.number().gt(0).max(10000),
});

export type BuyFormValues = z.infer<typeof BuyFormSchema>;
