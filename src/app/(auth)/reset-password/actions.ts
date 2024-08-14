"use server";

import { database as db } from "@/db/database";
import { passwordResetTokens } from "@/db/schema";
import { env } from "@/env";
import { EmailTemplate, sendMail } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import { createDate, TimeSpan } from "oslo";

// eslint-disable-next-line no-unused-vars
async function generatePasswordResetToken(userId: string): Promise<string> {
  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.userId, userId));
  const tokenId = generateId(40);
  await db.insert(passwordResetTokens).values({
    id: tokenId,
    userId,
    expiresAt: createDate(new TimeSpan(2, "h")),
  });
  return tokenId;
}

export async function sendPasswordResetLink(
  _: any,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const email = formData.get("email");
  const parsed = forgotPasswordSchema.safeParse(email);
  if (!parsed.success) {
    return { error: "Provided email is invalid." };
  }
  try {
    const user = await db.query.users.findFirst({
      where: (table, { eq }) => eq(table.email, parsed.data),
    });

    if (!user || !user.emailVerified)
      return { error: "Provided email is invalid." };

    const verificationToken = await generatePasswordResetToken(user.id);

    const verificationLink = `${env.NEXT_PUBLIC_APP_URL}/reset-password/${verificationToken}`;

    await sendMail(user.email, EmailTemplate.PasswordReset, {
      link: verificationLink,
    });

    return { success: true };
  } catch (error) {
    return { error: "Failed to send verification email." };
  }
}
