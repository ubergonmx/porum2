"use server";

import { database as db } from "@/db/database";
import { passwordResetTokens, users } from "@/db/schema";
import { lucia } from "@/lib/auth";
import { argon2idConfig } from "@/lib/auth/hash";
import { resetPasswordSchema } from "@/lib/validators/auth";
import { hash } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { isWithinExpirationDate } from "oslo";

export async function resetPassword(
  _: any,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const obj = Object.fromEntries(formData.entries());

  const parsed = resetPasswordSchema.safeParse(obj);

  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      error: err.fieldErrors.password?.[0] ?? err.fieldErrors.token?.[0],
    };
  }
  const { token, password } = parsed.data;

  const dbToken = await db.transaction(async (tx) => {
    const item = await tx.query.passwordResetTokens.findFirst({
      where: (table, { eq }) => eq(table.id, token),
    });
    if (item) {
      await tx
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.id, item.id));
    }
    return item;
  });

  if (!dbToken) return { error: "Invalid password reset link" };

  if (!isWithinExpirationDate(dbToken.expiresAt))
    return { error: "Password reset link expired." };

  await lucia.invalidateUserSessions(dbToken.userId);
  const hashedPassword = await hash(password, argon2idConfig);
  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, dbToken.userId));

  return { success: true };
}
