import { z } from "zod";

export const TransferFormSchema = z.object({
  /** ID of the destination fund (must be a non-empty string). */
  toFundId: z.string().min(1),
  /** Number of units to transfer. Must be positive. */
  quantity: z.number().gt(0),
});

export type TransferFormValues = z.infer<typeof TransferFormSchema>;
