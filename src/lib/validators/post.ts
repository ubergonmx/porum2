import { z } from "zod";

export const postSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(128, "Title must be less than 128 characters long"),
  subporumId: z.string(),
  content: z.any(),
});

export type PostInput = z.infer<typeof postSchema>;
