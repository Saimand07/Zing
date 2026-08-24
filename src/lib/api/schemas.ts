import { z } from 'zod';
export const IntentSchema = z.object({
  sellToken: z.string(),
  buyToken: z.string(),
  amount: z.string(),
});
