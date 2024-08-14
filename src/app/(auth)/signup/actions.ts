"use server";

import { signupSchema, SignupInput } from "@/lib/validators/auth";
import { database as db } from "@/db/database";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// import { generateIdFromEntropySize } from "lucia";
import { hash } from "@node-rs/argon2";
import { users } from "@/db/schema";
import { lucia } from "@/lib/auth";
import { Paths } from "@/lib/constants";
import { ActionResponse } from "@/lib/types";
// import { writeFile as fsWriteFile } from "fs/promises";
import { env } from "@/env";
import { standardRateLimit, getIP } from "@/lib/ratelimit";
import { argon2idConfig } from "@/lib/auth/hash";
import { EmailTemplate, sendMail } from "@/lib/email";
import { generateEmailVerificationCode } from "../verify-email/actions";
import { isRedirectError } from "next/dist/client/components/redirect";
import {
  FormError,
  formErrorStringify,
  unknownErrorStringify,
} from "@/lib/error";
// import { uploadFiles } from "@/lib/uploadthing";

export async function signup(
  values: SignupInput,
  formData: FormData
): Promise<ActionResponse<SignupInput>> {
  try {
    const { success } = await standardRateLimit.limit(getIP() ?? values.email);

    if (!success) {
      throw new FormError("SignupError", "Rate limit exceeded", {
        userMessage: "Too many requests, please try again later",
        details: `IP: ${getIP()}`,
      });
    }

    const obj = Object.fromEntries(formData.entries());
    values.avatar = obj.avatar as File;
    const parsed = await signupSchema
      .omit({ phone: true })
      .safeParseAsync(values);
    if (!parsed.success) {
      const err = parsed.error.flatten();
      throw new FormError<SignupInput>("SignupError", "Invalid form data", {
        fieldError: {
          firstName: err.fieldErrors.firstName?.[0],
          lastName: err.fieldErrors.lastName?.[0],
          username: err.fieldErrors.username?.[0],
          email: err.fieldErrors.email?.[0],
          password: err.fieldErrors.password?.[0],
          avatar: err.fieldErrors.avatar?.[0],
        },
        details: `IP: ${getIP()}`,
      });
    }

    const {
      firstName,
      lastName,
      username,
      email,
      password,
      // avatar
    } = parsed.data;
    const phone = values.phone;

    const existingUsername = await db.query.users.findFirst({
      where: (table, { eq }) => eq(table.username, username),
      columns: { username: true },
    });
    if (existingUsername) {
      throw new FormError("SignupError", "Username already exists", {
        fieldError: {
          username: "Username already exists",
        },
        details: `IP: ${getIP()}`,
      });
    }

    const existingEmail = await db.query.users.findFirst({
      where: (table, { eq }) => eq(table.email, email),
      columns: { email: true },
    });

    if (existingEmail) {
      throw new FormError("SignupError", "Email already exists", {
        fieldError: {
          email: "Cannot create account with that email",
        },
        details: `IP: ${getIP()}`,
      });
    }

    // let url: string | undefined;
    // if (avatar) {
    //   if (env.STORAGE === "local") {
    //     url = `${Date.now()}-${generateIdFromEntropySize(5)}-${avatar.name.replaceAll(" ", "_")}`;
    //     const buffer = Buffer.from(await avatar.arrayBuffer());
    //     const fullPath = process.cwd() + "/" + env.LOCAL_AVATAR_PATH + url;
    //     await fsWriteFile(fullPath, buffer);

    //     console.log("[SIGNUP] Avatar saved to", fullPath);
    //   } else if (env.STORAGE === "online") {
    //     const [res] = await uploadFiles("avatar", {
    //       files: [avatar],
    //     });
    //     url = res.url;
    //   }
    // }
    const hashedPassword = await hash(password, argon2idConfig);

    const [user] = await db
      .insert(users)
      .values({
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
        phoneNumber: phone,
        role: "user",
        // avatar: url,
      })
      .returning();

    const verificationCode = await generateEmailVerificationCode(
      user.id,
      email
    );
    await sendMail(email, EmailTemplate.EmailVerification, {
      code: verificationCode,
    });

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    console.log(
      `[SIGNUP] User created successfully: ${user.id}(${user.username})`
    );
    return redirect(Paths.VerifyEmail);
  } catch (error: any | FormError<SignupInput>) {
    if (isRedirectError(error)) throw error; // thrown exclusively because of redirect

    let errorMessage = "An error occurred, please try again later";
    if (error instanceof FormError) {
      console.error(`[SIGNUP] ${error.name}: ${error.message}`);
      if (env.DEBUG_MODE) console.error(formErrorStringify(error));

      errorMessage = error.userMessage ?? errorMessage;
      if (error.fieldError) return { fieldError: error.fieldError };
    } else {
      console.error(`[SIGNUP] Unexpected error: ${error.message}`);
      if (env.DEBUG_MODE) console.error(unknownErrorStringify(error));
    }
    return {
      formError: errorMessage,
    };
  }
}
