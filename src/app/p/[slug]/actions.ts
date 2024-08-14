"use server";

import { validateRequest } from "@/lib/auth/validate-request";
import { database as db } from "@/db/database";
import {
  ActionError,
  actionErrorStringify,
  UnauthorizedError,
  unauthorizedErrorStringify,
  unknownErrorStringify,
} from "@/lib/error";
import { getIP } from "@/lib/ratelimit";
import { ActionResponse } from "@/lib/types";
import {
  subporumSubscriptionSchema,
  SubscribeToSubporumInput,
} from "@/lib/validators/subporum";
import { and, eq } from "drizzle-orm";
import { subscriptions } from "@/db/schema";
import { env } from "@/env";

export async function subscribeSubporum(
  input: SubscribeToSubporumInput,
): Promise<ActionResponse<SubscribeToSubporumInput>> {
  try {
    const { user } = await validateRequest();

    if (!user) throw new UnauthorizedError(`IP: ${getIP()}`);

    const parsed = await subporumSubscriptionSchema.safeParseAsync(input);
    if (!parsed.success) {
      const err = parsed.error.flatten();
      throw new ActionError("Invalid Subporum subscription", {
        userMessage: err.fieldErrors.subporumId?.[0],
        details: `User: ${user.id} (${user.username}), IP: ${getIP()}`,
      });
    }

    const { subporumId, minimumDays, createdAt } = parsed.data;

    const subscription = await db.query.subscriptions.findFirst({
      where: (table, { eq }) =>
        and(eq(table.subporumId, subporumId), eq(table.userId, user.id)),
    });

    if (subscription)
      throw new ActionError("Already subscribed", {
        userMessage: "You are already subscribed to this subporum",
        details: `User: ${user.id} (${user.username}), IP: ${getIP()}`,
      });

    if (user.createdAt !== null) {
      const diff = Math.abs(user.createdAt.getTime() - createdAt.getTime());
      const daysDiff = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (daysDiff < minimumDays)
        throw new ActionError("Minimum days not met", {
          userMessage: `You must be a user for at least ${minimumDays} days`,
          details: `User: ${user.id} (${user.username}), IP: ${getIP()}`,
        });
    }

    await db
      .insert(subscriptions)
      .values({
        subporumId,
        userId: user.id,
      })
      .execute();

    console.log(`[SUBSCRIBE] User ${user.id} joined subporum ${subporumId}`);
    return { success: true };
  } catch (error: any) {
    let errorMessage = "An error occurred while subscribing to subporum";
    if (error instanceof ActionError) {
      console.error(`[SUBSCRIBE] ${error.name}: ${error.userMessage}`);
      if (env.DEBUG_MODE) console.error(actionErrorStringify(error));
      errorMessage = error.userMessage ?? errorMessage;
    } else if (error instanceof UnauthorizedError) {
      console.error(`[SUBSCRIBE] ${error.name}: ${error.message}`);
      if (env.DEBUG_MODE) console.error(unauthorizedErrorStringify(error));
      errorMessage = error.message;
    } else {
      console.error(`[SUBSCRIBE] Unexpected error: ${error.message}`);
      if (env.DEBUG_MODE) console.error(unknownErrorStringify(error));
    }
    return { formError: errorMessage };
  }
}

export async function unsubscribeSubporum(
  input: SubscribeToSubporumInput,
): Promise<ActionResponse<SubscribeToSubporumInput>> {
  try {
    const { user } = await validateRequest();

    if (!user) throw new UnauthorizedError(`IP: ${getIP()}`);

    const parsed = await subporumSubscriptionSchema.safeParseAsync(input);
    if (!parsed.success) {
      const err = parsed.error.flatten();
      throw new ActionError("Invalid Subporum subscription", {
        userMessage: err.fieldErrors.subporumId?.[0],
        details: `User: ${user.id} (${user.username}), IP: ${getIP()}`,
      });
    }

    const { subporumId } = parsed.data;

    const subscription = await db.query.subscriptions.findFirst({
      where: (table, { eq }) =>
        and(eq(table.subporumId, subporumId), eq(table.userId, user.id)),
    });

    if (!subscription)
      throw new ActionError("Not subscribed", {
        userMessage: "You are not subscribed to this subporum",
        details: `User: ${user.id} (${user.username}), IP: ${getIP()}`,
      });

    await db
      .delete(subscriptions)
      .where(
        and(
          eq(subscriptions.subporumId, subporumId),
          eq(subscriptions.userId, user.id),
        ),
      );
    console.log(`[UNSUBSCRIBE] User ${user.id} left subporum ${subporumId}`);
    return { success: true };
  } catch (error: any) {
    let errorMessage = "An error occurred while unsubscribing from subporum";
    if (error instanceof ActionError) {
      console.error(`[UNSUBSCRIBE] ${error.name}: ${error.details}`);
      if (env.DEBUG_MODE) console.error(actionErrorStringify(error));
      errorMessage = error.userMessage ?? errorMessage;
    } else if (error instanceof UnauthorizedError) {
      console.error(`[UNSUBSCRIBE] ${error.name}: ${error.message}`);
      if (env.DEBUG_MODE) console.error(unauthorizedErrorStringify(error));
      errorMessage = error.message;
    } else {
      console.error(`[UNSUBSCRIBE] Unexpected error: ${error.message}`);
      if (env.DEBUG_MODE) console.error(unknownErrorStringify(error));
    }
    return { formError: errorMessage };
  }
}
