import { validateRequest } from "@/lib/auth/validate-request";
import { database as db } from "@/db/database";
import PostFeed from "../post-feed";
import { notFound } from "next/navigation";

const CustomFeed = async () => {
  const { user } = await validateRequest();

  // only rendered if session exists, so this will not happen
  if (!user) return notFound();

  const followedCommunities = await db.query.subscriptions.findMany({
    where: (table, { eq }) => eq(table.userId, user.id),
    with: {
      subporum: true,
    },
  });

  // const posts = await db.post.findMany({
  //   where: {
  //     subporum: {
  //       name: {
  //         in: followedCommunities.map((sub) => sub.subporum.name),
  //       },
  //     },
  //   },
  //   orderBy: {
  //     createdAt: "desc",
  //   },
  //   include: {
  //     votes: true,
  //     author: true,
  //     comments: true,
  //     subporum: true,
  //   },
  // });

  const posts = await db.query.posts.findMany({
    where: (posts, { inArray }) =>
      inArray(
        posts.subporumId,
        followedCommunities.map((sub) => sub.subporumId),
      ),
    orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    with: {
      votes: true,
      author: true,
      comments: true,
      subporum: true,
    },
  });

  return <PostFeed initialPosts={posts} />;
};

export default CustomFeed;
