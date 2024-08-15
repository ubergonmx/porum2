import { validateRequest } from "@/lib/auth/validate-request";
import { database as db } from "@/db/database";
import { redis } from "@/lib/redis";
import { postVoteSchema } from "@/lib/validators/vote";
import { CachedPost } from "@/lib/types/redis";
import { z } from "zod";
import { votes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { APIError, apiErrorStringify } from "@/lib/error";
import { env } from "@/env";

const CACHE_AFTER_UPVOTES = 1;

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { postId, voteType } = postVoteSchema.parse(body);

    const { user } = await validateRequest();

    if (!user) {
      // return new Response("Unauthorized", { status: 401 });
      throw new APIError("UnauthorizedAPIError", "Unauthorized", 401, {
        userMessage: "You must be logged in to vote",
        details: `IP: ${req.headers.get("cf-connecting-ip")}`,
      });
    }

    // check if user has already voted on this post
    const existingVote = await db.query.votes.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.postId, postId), eq(table.userId, user.id)),
    });

    const post = await db.query.posts.findFirst({
      where: (table, { eq }) => eq(table.id, postId),
      with: {
        author: true,
        votes: true,
      },
    });

    if (!post) {
      // return new Response("Post not found", { status: 404 });
      throw new APIError("PostNotFoundAPIError", "Post not found", 404, {
        userMessage: "Post not found",
        details: `Post ID: ${postId}`,
      });
    }

    if (existingVote) {
      // if vote type is the same as existing vote, delete the vote
      if (existingVote.vote === voteType) {
        await db
          .delete(votes)
          .where(and(eq(votes.postId, postId), eq(votes.userId, user.id)));

        console.log(
          "[PATCH_VOTE] Vote deleted for post",
          postId,
          "by user",
          user.id,
        );

        // Recount the votes
        const votesAmt = post.votes.reduce((acc, vote) => {
          if (vote.vote === "up") return acc + 1;
          if (vote.vote === "down") return acc - 1;
          return acc;
        }, 0);

        if (votesAmt >= CACHE_AFTER_UPVOTES) {
          const cachePayload: CachedPost = {
            authorUsername: post.author.username ?? "",
            content: JSON.stringify(post.content),
            id: post.id,
            title: post.title,
            currentVote: null,
            createdAt: post.createdAt!,
          };

          await redis.hset(`post:${postId}`, cachePayload); // Store the post data as a hash
          console.log("[PATCH_VOTE] Post cached by user", user.id);
        }

        return new Response("OK");
      }

      // if vote type is different, update the vote
      await db
        .update(votes)
        .set({ vote: voteType })
        .where(and(eq(votes.postId, postId), eq(votes.userId, user.id)));

      console.log(
        "[PATCH_VOTE] Vote updated for post",
        postId,
        "by user",
        user.id,
      );

      // Recount the votes
      const votesAmt = post.votes.reduce((acc, vote) => {
        if (vote.vote === "up") return acc + 1;
        if (vote.vote === "down") return acc - 1;
        return acc;
      }, 0);

      if (votesAmt >= CACHE_AFTER_UPVOTES) {
        const cachePayload: CachedPost = {
          authorUsername: post.author.username ?? "",
          content: JSON.stringify(post.content),
          id: post.id,
          title: post.title,
          currentVote: voteType,
          createdAt: post.createdAt!,
        };

        await redis.hset(`post:${postId}`, cachePayload); // Store the post data as a hash
        console.log("[PATCH_VOTE] Post cached by user", user.id);
      }

      return new Response("OK");
    }

    // if no existing vote, create a new vote
    await db.insert(votes).values({
      vote: voteType,
      userId: user.id,
      postId,
    });
    console.log(
      "[PATCH_VOTE] Vote created for post",
      postId,
      "by user",
      user.id,
    );

    // Recount the votes
    const votesAmt = post.votes.reduce((acc, vote) => {
      if (vote.vote === "up") return acc + 1;
      if (vote.vote === "down") return acc - 1;
      return acc;
    }, 0);

    if (votesAmt >= CACHE_AFTER_UPVOTES) {
      const cachePayload: CachedPost = {
        authorUsername: post.author.username ?? "",
        content: JSON.stringify(post.content),
        id: post.id,
        title: post.title,
        currentVote: voteType,
        createdAt: post.createdAt!,
      };

      await redis.hset(`post:${postId}`, cachePayload); // Store the post data as a hash
      console.log("[PATCH_VOTE] Post cached by user", user.id);
    }

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[PATCH_VOTE] ZodError", error.errors);
      if (env.DEBUG_MODE)
        console.error(JSON.stringify({ error, stack: error.stack }, null, 2));
      return new Response(error.message, { status: 400 });
    } else if (error instanceof APIError) {
      console.error(`[PATCH_VOTE] ${error.name}: ${error.details}`);
      if (env.DEBUG_MODE) console.error(apiErrorStringify(error));
      return new Response(error.userMessage, { status: error.status });
    }
    return new Response(
      "Could not post to subporum at this time. Please try later",
      { status: 500 },
    );
  }
}
