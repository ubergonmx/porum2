"use server";

import { database as db } from "@/db/database";
import { subporums, subscriptions } from "@/db/schema";
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
import { CreateSubporumInput, subporumSchema } from "@/lib/validators/subporum";

export async function createSubporum(
  input: CreateSubporumInput,
): Promise<ActionResponse<CreateSubporumInput>> {
  try {
    const { user } = await validateRequest();

    if (!user) throw new UnauthorizedError(`IP: ${getIP()}`);

    const parsed = await subporumSchema.safeParseAsync(input);
    if (!parsed.success) {
      const err = parsed.error.flatten();
      throw new FormError<CreateSubporumInput>(
        "CreateSubporumError",
        "Invalid form data",
        {
          fieldError: {
            name: err.fieldErrors.name?.[0],
          },
          details: `User: ${user.id} (${user.username}), IP: ${getIP()}`,
        },
      );
    }

    const { name, minimumDays } = parsed.data;

    const existingSubporum = await db.query.subporums.findFirst({
      where: (table, { eq }) => eq(table.name, name),
      columns: { name: true },
    });

    if (existingSubporum) {
      throw new FormError("CreateSubporumError", "Subporum already exists", {
        fieldError: {
          name: "Subporum already exists",
        },
        details: `User: ${user.id} (${user.username}), IP: ${getIP()}`,
      });
    }

    const [subporum] = await db
      .insert(subporums)
      .values({
        name,
        minimumDays,
        userId: user.id,
      })
      .returning();

    await db
      .insert(subscriptions)
      .values({
        subporumId: subporum.id,
        userId: user.id,
      })
      .execute();

    console.log(
      `[CREATE_SUBPORUM] Subporum created and subscribed with id: ${subporum.id} (${subporum.name}) by user: ${user.id} (${user.username})`,
    );

    return { success: true, redirect: subporum.name };
  } catch (error: any | FormError<CreateSubporumInput>) {
    let errorMessage = "An error occurred, please try again later";
    if (error instanceof FormError) {
      console.error(`[CREATE_SUBPORUM] ${error.name}: ${error.details}`);
      if (env.DEBUG_MODE) console.error(formErrorStringify(error));

      errorMessage = error.userMessage ?? errorMessage;
      if (error.fieldError) return { fieldError: error.fieldError };
    } else if (error instanceof UnauthorizedError) {
      console.error(`[CREATE_SUBPORUM] ${error.name}: ${error.message}`);
      if (env.DEBUG_MODE) console.error(unauthorizedErrorStringify(error));
      errorMessage = error.message;
    } else {
      console.error(`[CREATE_SUBPORUM] Unexpected error: ${error.message}`);
      if (env.DEBUG_MODE) console.error(unknownErrorStringify(error));
    }
    return { formError: errorMessage };
  }
}
