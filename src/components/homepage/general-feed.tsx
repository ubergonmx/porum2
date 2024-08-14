import { database as db } from "@/db/database";
import { posts } from "@/db/schema";
import PostFeed from "../post-feed";
import { desc } from "drizzle-orm";
const GeneralFeed = async () => {
  const postsArray = await db.query.posts.findMany({
    orderBy: [desc(posts.createdAt)],
    with: {
      votes: true,
      author: true,
      comments: true,
      subporum: true,
    },
  });

  return <PostFeed initialPosts={postsArray} />;
};

export default GeneralFeed;
