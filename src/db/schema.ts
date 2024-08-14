import {
  pgTableCreator,
  index,
  text,
  timestamp,
  pgEnum,
  AnyPgColumn,
  primaryKey,
  json,
  integer,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { generateIdFromEntropySize } from "lucia";
import { relations } from "drizzle-orm";

export const pgTable = pgTableCreator((name: string) => `${prefix}_${name}`);

export const roleEnum = pgEnum("role", ["admin", "moderator", "user"]);

export const users = pgTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateIdFromEntropySize(10)),
    username: text("username").unique().notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").unique().notNull(),
    emailVerified: timestamp("email_verified", { mode: "date" }),
    password: text("password").notNull(),
    phoneNumber: text("phone_number"),
    avatar: text("avatar"),
    role: roleEnum("role").notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    }).$onUpdate(() => new Date()),
  },
  (t) => ({
    emailIdx: index("user_email_idx").on(t.email),
  }),
);

export const userRelations = relations(users, ({ many }) => ({
  subporums: many(subporums),
  posts: many(posts),
  comments: many(comments),
  votes: many(votes),
  commentVotes: many(commentVotes),
  subscriptions: many(subscriptions),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
  },
  (t) => ({
    userIdx: index("session_user_idx").on(t.userId),
  }),
);

export const emailVerificationCodes = pgTable(
  "email_verification_codes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateIdFromEntropySize(10)),
    userId: text("user_id")
      .unique()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    code: text("code").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
  },
  (t) => ({
    userIdx: index("verification_code_user_idx").on(t.userId),
    emailIdx: index("verification_code_email_idx").on(t.email),
  }),
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateIdFromEntropySize(10)),
    userId: text("user_id").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
  },
  (t) => ({
    userIdx: index("password_token_user_idx").on(t.userId),
  }),
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subporumId: text("subporum_id")
      .notNull()
      .references(() => subporums.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).defaultNow(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.subporumId] }) }),
);

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  subporum: one(subporums, {
    fields: [subscriptions.subporumId],
    references: [subporums.id],
  }),
}));

export const subporums = pgTable(
  "subporums",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateIdFromEntropySize(10)),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").unique().notNull(),
    description: text("description"),
    minimumDays: integer("minimumDays").notNull().default(0),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).defaultNow(),
  },
  (t) => ({
    nameIdx: index("subporum_name_idx").on(t.name),
  }),
);

export const subporumsRelations = relations(subporums, ({ one, many }) => ({
  creator: one(users, {
    fields: [subporums.userId],
    references: [users.id],
  }),
  posts: many(posts),
  subscribers: many(subscriptions),
}));

export type Subporum = typeof subporums.$inferSelect;
export type NewSubporum = typeof subporums.$inferInsert;

export const posts = pgTable(
  "posts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateIdFromEntropySize(10)),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subporumId: text("subporum_id")
      .notNull()
      .references(() => subporums.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: json("content"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).defaultNow(),
  },
  (t) => ({
    dateIdx: index("post_date_idx").on(t.createdAt),
    userIdx: index("post_user_idx").on(t.userId),
  }),
);

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  subporum: one(subporums, {
    fields: [posts.subporumId],
    references: [subporums.id],
  }),
  comments: many(comments),
  votes: many(votes),
}));

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export const deletedEnum = pgEnum("deleted", ["true", "false"]);
export const comments = pgTable(
  "comments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateIdFromEntropySize(10)),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).defaultNow(),
    replyToId: text("reply_to_id").references((): AnyPgColumn => comments.id),
    deleted: deletedEnum("deleted").notNull().default("false"),
  },
  (t) => ({
    dateIdx: index("comment_date_idx").on(t.createdAt),
    userIdx: index("comment_user_idx").on(t.userId),
    postIdIdx: index("comment_post_idx").on(t.postId),
  }),
);

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  votes: many(commentVotes),
  replyTo: one(comments, {
    fields: [comments.replyToId],
    references: [comments.id],
  }),
}));

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

export const voteEnum = pgEnum("vote", ["up", "down"]);
export const votes = pgTable(
  "votes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateIdFromEntropySize(10)),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    vote: voteEnum("vote").notNull(),
  },
  (t) => ({
    userIdx: index("vote_user_idx").on(t.userId),
    postIdIdx: index("vote_post_idx").on(t.postId),
    voteIdx: index("vote_idx").on(t.userId, t.postId),
  }),
);

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [votes.postId],
    references: [posts.id],
  }),
}));

export type Vote = typeof votes.$inferSelect;
export type NewVote = typeof votes.$inferInsert;
export type VoteType = "up" | "down";

export const commentVotes = pgTable(
  "comment_votes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateIdFromEntropySize(10)),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    commentId: text("comment_id")
      .notNull()
      .references(() => comments.id, { onDelete: "cascade" }),
    vote: voteEnum("vote").notNull(),
  },
  (t) => ({
    userIdx: index("comment_vote_user_idx").on(t.userId),
    commentIdIdx: index("comment_vote_comment_idx").on(t.commentId),
    voteIdx: index("comment_vote_idx").on(t.userId, t.commentId),
  }),
);

export const commentVotesRelations = relations(commentVotes, ({ one }) => ({
  user: one(users, {
    fields: [commentVotes.userId],
    references: [users.id],
  }),
  comment: one(comments, {
    fields: [commentVotes.commentId],
    references: [comments.id],
  }),
}));

export type CommentVote = typeof commentVotes.$inferSelect;
export type NewCommentVote = typeof commentVotes.$inferInsert;
