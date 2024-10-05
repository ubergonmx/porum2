"use server";

import { database } from "@/db/database";
import {
  User,
  users,
  Subporum,
  subporums,
  Post,
  posts,
  Comment,
  comments,
} from "@/db/schema";
import { eq } from "drizzle-orm";

// User actions
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

// Subporum actions
export async function fetchSubporums() {
  try {
    const subporumResults: Subporum[] = await database.query.subporums.findMany(
      {
        with: {
          creator: true,
        },
      },
    );
    return subporumResults;
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.stack);
    }
  }
  return [];
}

export async function deleteSubporum(subporumId: string) {
  try {
    const deletedSubporum = await database
      .delete(subporums)
      .where(eq(subporums.id, subporumId))
      .returning();

    console.log(`Deleted subporum: ${deletedSubporum}`);
    return deletedSubporum;
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.stack);
    }
  }
  return null;
}

// Post actions
export async function fetchPosts() {
  try {
    const postResults: Post[] = await database.query.posts.findMany({
      with: {
        author: true,
        subporum: true,
      },
    });
    return postResults;
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.stack);
    }
  }
  return [];
}

export async function deletePost(postId: string) {
  try {
    const deletedPost = await database
      .delete(posts)
      .where(eq(posts.id, postId))
      .returning();

    console.log(`Deleted post: ${deletedPost}`);
    return deletedPost;
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.stack);
    }
  }
  return null;
}

// Comment actions
export async function fetchComments() {
  try {
    const commentResults: Comment[] = await database.query.comments.findMany({
      with: {
        author: true,
        post: true,
      },
    });
    return commentResults;
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.stack);
    }
  }
  return [];
}

export async function deleteComment(commentId: string) {
  try {
    const deletedComment = await database
      .delete(comments)
      .where(eq(comments.id, commentId))
      .returning();

    console.log(`Deleted comment: ${deletedComment}`);
    return deletedComment;
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.stack);
    }
  }
  return null;
}
