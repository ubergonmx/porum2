import { Vote } from "@/db/schema";

export type CachedPost = {
  id: string;
  title: string;
  authorUsername: string;
  content: string;
  currentVote: Vote["type"] | null;
  createdAt: Date;
};
