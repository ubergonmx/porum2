import { validateRequest } from "@/lib/auth/validate-request";
import { database as db } from "@/db/database";
import { notFound } from "next/navigation";
import { desc } from "drizzle-orm";
import { subporums } from "@/db/schema";
import MiniCreatePost from "@/components/mini-create-post";
import PostFeed from "@/components/post-feed";

interface PageProps {
  params: {
    slug: string;
  };
}

const page = async ({ params }: PageProps) => {
  const { slug } = params;

  const { user } = await validateRequest();

  const subporum = await db.query.subporums.findFirst({
    where: (table, { eq }) => eq(table.name, slug),
    orderBy: [desc(subporums.createdAt)],
    with: {
      posts: {
        with: {
          author: true,
          comments: true,
          votes: true,
          subporum: true,
        },
      },
    },
  });

  if (!subporum) return notFound();

  return (
    <>
      <h1 className="h-14 text-3xl font-bold md:text-4xl">p/{subporum.name}</h1>
      <MiniCreatePost user={user} />
      <PostFeed initialPosts={subporum.posts} subporumName={subporum.name} />
    </>
  );
};

export default page;
