import { z } from "zod";

export const postVoteSchema = z.object({
  postId: z.string(),
  voteType: z.enum(["up", "down"]),
});

export type PostVoteRequest = z.infer<typeof postVoteSchema>;

export const commentVoteSchema = z.object({
  commentId: z.string(),
  voteType: z.enum(["up", "down"]),
});

export type CommentVoteRequest = z.infer<typeof commentVoteSchema>;
