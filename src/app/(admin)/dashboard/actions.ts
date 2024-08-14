"use server";

import { database } from "@/db/database";
import { User, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function fetchUsers() {
  try {
    const userResults: User[] = await database.query.users.findMany();
    return userResults;
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.stack);
    }
  }
  return [];
}

export async function updateUser(userId: string, username: string) {
  try {
    const updatedUser = await database
      .update(users)
      .set({ username })
      .where(eq(users.id, userId))
      .returning();

    console.log(`Updated user: ${updatedUser}`);
    return updatedUser;
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.stack);
    }
  }
  return null;
}

export async function deleteUser(userId: string) {
  try {
    const deletedUser = await database
      .delete(users)
      .where(eq(users.id, userId))
      .returning();

    console.log(`Deleted user: ${deletedUser}`);
    return deletedUser;
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.stack);
    }
  }
  return null;
}
