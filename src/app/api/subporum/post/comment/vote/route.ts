import { validateRequest } from "@/lib/auth/validate-request";
import { database as db } from "@/db/database";
import { commentVoteSchema } from "@/lib/validators/vote";
import { z } from "zod";
import { commentVotes } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { commentId, voteType } = commentVoteSchema.parse(body);

    const { user } = await validateRequest();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // check if user has already voted on this comment
    const existingVote = await db.query.commentVotes.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.commentId, commentId), eq(table.userId, user.id)),
    });

    if (existingVote) {
      // if vote type is the same as existing vote, delete the vote
      if (existingVote.vote === voteType) {
        await db
          .delete(commentVotes)
          .where(
            and(
              eq(commentVotes.commentId, commentId),
              eq(commentVotes.userId, user.id),
            ),
          );
        return new Response("OK");
      } else {
        // if vote type is different, update the vote
        await db
          .update(commentVotes)
          .set({ vote: voteType })
          .where(
            and(
              eq(commentVotes.commentId, commentId),
              eq(commentVotes.userId, user.id),
            ),
          );
        return new Response("OK");
      }
    }

    // if no existing vote, create a new vote
    await db.insert(commentVotes).values({
      vote: voteType,
      userId: user.id,
      commentId,
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    return new Response(
      "Could not post to subporum at this time. Please try later",
      { status: 500 },
    );
  }
}
