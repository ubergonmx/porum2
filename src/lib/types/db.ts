import type { Post, Subporum, User, Vote, Comment } from "@/db/schema";

export type ExtendedPost = Post & {
  subporum: Subporum;
  votes: Vote[];
  author: User;
  comments: Comment[];
};
