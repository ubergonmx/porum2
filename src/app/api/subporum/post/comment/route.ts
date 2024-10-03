import { validateRequest } from "@/lib/auth/validate-request";
import { database as db } from "@/db/database";
import { CommentValidator } from "@/lib/validators/comment";
import { z } from "zod";
import { comments } from "@/db/schema";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { postId, text, replyToId } = CommentValidator.parse(body);

    const { user } = await validateRequest();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // if no existing vote, create a new vote
    await db.insert(comments).values({
      content: text,
      postId,
      userId: user.id,
      replyToId,
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
