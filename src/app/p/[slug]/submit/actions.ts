"use server";

import { database as db } from "@/db/database";
import { posts } from "@/db/schema";
import { env } from "@/env";
import { validateRequest } from "@/lib/auth/validate-request";
import {
  FormError,
  formErrorStringify,
  UnauthorizedError,
  unauthorizedErrorStringify,
  unknownErrorStringify,
} from "@/lib/error";
import { getIP } from "@/lib/ratelimit";
import { ActionResponse } from "@/lib/types";
import { PostInput, postSchema } from "@/lib/validators/post";
import { and } from "drizzle-orm";

export async function submitPost(
  input: PostInput,
): Promise<ActionResponse<PostInput>> {
  try {
    const { user } = await validateRequest();

    if (!user) throw new UnauthorizedError(`IP: ${getIP()}`);

    const parsed = await postSchema.safeParseAsync(input);
    if (!parsed.success) {
      const err = parsed.error.flatten();
      throw new FormError<PostInput>("SubmitPostError", "Invalid form data", {
        fieldError: {
          title: err.fieldErrors.title?.[0],
          content: err.fieldErrors.content?.[0],
          subporumId: err.fieldErrors.subporumId?.[0],
        },
        details: `User: ${user.id} (${user.username}), IP: ${getIP()}`,
      });
    }

    const { title, content, subporumId } = parsed.data;

    const subscription = await db.query.subscriptions.findFirst({
      where: (table, { eq }) =>
        and(eq(table.subporumId, subporumId), eq(table.userId, user.id)),
    });

    if (!subscription) {
      throw new FormError<PostInput>("SubmitPostError", "Not subscribed", {
        userMessage: "Subscribe to the subporum before submitting a post",
        details: `User: ${user.id} (${user.username}), IP: ${getIP()}`,
      });
    }

    const [post] = await db
      .insert(posts)
      .values({
        title,
        content,
        userId: user.id,
        subporumId,
      })
      .returning();

    console.log(
      `[SUBMIT_POST] User ${user.id} (${user.username}) submitted post ${post.id} to subporum ${subporumId}`,
    );

    return { success: true };
  } catch (error: any | FormError<PostInput>) {
    let errorMessage = "An error occurred, please try again later";
    if (error instanceof FormError) {
      console.error(`[SUBMIT_POST] ${error.name}: ${error.details}`);
      if (env.DEBUG_MODE) console.error(formErrorStringify(error));

      errorMessage = error.userMessage ?? errorMessage;
      if (error.fieldError) return { fieldError: error.fieldError };
    } else if (error instanceof UnauthorizedError) {
      console.error(`[SUBMIT_POST] ${error.name}: ${error.message}`);
      if (env.DEBUG_MODE) console.error(unauthorizedErrorStringify(error));
      errorMessage = error.message;
    } else {
      console.error(`[SUBMIT_POST] Unexpected error: ${error.message}`);
      if (env.DEBUG_MODE) console.error(unknownErrorStringify(error));
    }
    return { formError: errorMessage };
  }
}
