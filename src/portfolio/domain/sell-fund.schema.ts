import { z } from "zod";

export const SellFormSchema = z.object({
  /** Number of units the user wants to sell. Must be positive. */
  quantity: z.number().gt(0),
});

export type SellFormValues = z.infer<typeof SellFormSchema>;
