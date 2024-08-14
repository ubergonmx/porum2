"use server";

import { loginSchema, LoginInput } from "@/lib/validators/auth";
import { database as db } from "@/db/database";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { lucia } from "@/lib/auth";
import { Paths } from "@/lib/constants";
import { ActionResponse } from "@/lib/types";
import { loginRateLimit, getIP } from "@/lib/ratelimit";
import { verify } from "@node-rs/argon2";
import { argon2idConfig } from "@/lib/auth/hash";
import { isRedirectError } from "next/dist/client/components/redirect";
import { env } from "@/env";
import {
  FormError,
  formErrorStringify,
  unknownErrorStringify,
} from "@/lib/error";

export async function login(
  values: LoginInput,
): Promise<ActionResponse<LoginInput>> {
  try {
    const { success } = await loginRateLimit.limit(getIP() ?? values.email);

    if (!success) {
      throw new FormError("LoginError", "Rate limit exceeded", {
        userMessage: "Too many requests, please try again later",
        details: `IP: ${getIP()}`,
      });
    }

    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      const err = parsed.error.flatten();
      throw new FormError<LoginInput>("LoginError", "Invalid form data", {
        fieldError: {
          email: err.fieldErrors.email?.[0],
          password: err.fieldErrors.password?.[0],
        },
        details: `IP: ${getIP()}`,
      });
    }

    const { email, password } = parsed.data;

    const user = await db.query.users.findFirst({
      where: (table, { eq }) => eq(table.email, email),
    });

    if (!user) {
      throw new FormError("LoginError", "User not found", {
        userMessage: "Incorrect email or password",
        details: `Email: ${email}, IP: ${getIP()}`,
      });
    }

    const validPassword = await verify(user.password, password, argon2idConfig);
    if (!validPassword) {
      throw new FormError("LoginError", "Invalid password", {
        userMessage: "Incorrect email or password",
        details: `Email: ${email}, IP: ${getIP()}`,
      });
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    if (user.role === "admin") {
      console.log(
        `[LOGIN] Admin logged in with id: ${user.id} (${user.username})`,
      );
      return redirect(Paths.AdminDashboard);
    }

    console.log(
      `[LOGIN] User logged in with id: ${user.id} (${user.username})`,
    );
    return redirect(Paths.Home);
  } catch (error: any | FormError<LoginInput>) {
    if (isRedirectError(error)) throw error; // thrown exclusively because of redirect

    let errorMessage = "An error occurred, please try again later";
    if (error instanceof FormError) {
      console.error(`[LOGIN] ${error.name}: ${error.message}`);
      if (env.DEBUG_MODE) console.error(formErrorStringify(error));

      errorMessage = error.userMessage ?? errorMessage;
      if (error.fieldError) return { fieldError: error.fieldError };
    } else {
      console.error(`[LOGIN] Unexpected error: ${error.message}`);
      if (env.DEBUG_MODE) console.error(unknownErrorStringify(error));
    }
    return {
      formError: errorMessage,
    };
  }
}
