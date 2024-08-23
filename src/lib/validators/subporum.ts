import { z } from "zod";

export const subporumSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Subporum name must be at least 3 characters")
    .max(21, "Subporum name must be at most 21 characters")
    .refine((name) => {
      // avoid word 'create'
      return name !== "create";
    }, "Subporum name cannot be 'create'")
    .transform((name) => name.replace(/\s+/g, "-")),
  minimumDays: z.coerce
    .number()
    .int("Minimum days must be an integer")
    .min(0, "Minimum days must be at least 0 days")
    .max(365, "Minimum days must be at most 365 days")
    .default(0),
  description: z.string().optional(),
});

export const subporumSubscriptionSchema = z.object({
  subporumId: z.string().trim(),
  minimumDays: z.number().int(),
  createdAt: z.date(),
});

export type CreateSubporumInput = z.infer<typeof subporumSchema>;
export type SubscribeToSubporumInput = z.infer<
  typeof subporumSubscriptionSchema
>;
