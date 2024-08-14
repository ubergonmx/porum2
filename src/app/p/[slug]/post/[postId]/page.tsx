// import CommentsSection from "@/components/CommentsSection";
import EditorOutput from "@/components/editor-output";
import PostVoteServer from "@/components/post-vote/server";
import { buttonVariants } from "@/components/ui/button";
import { database as db } from "@/db/database";
import { redis } from "@/lib/redis";
import { formatTimeToNow } from "@/lib/utils";
import { CachedPost } from "@/lib/types/redis";
import { Post, User, Vote } from "@/db/schema";
import { ArrowBigDown, ArrowBigUp, Loader2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface SubPorumPostPageProps {
  params: {
    postId: string;
  };
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const SubPorumPostPage = async ({ params }: SubPorumPostPageProps) => {
  const cachedPost = (await redis.hgetall(
    `post:${params.postId}`,
  )) as CachedPost;

  let post: (Post & { votes: Vote[]; author: User }) | null = null;

  if (!cachedPost) {
    const postQuery = await db.query.posts.findFirst({
      where: (table, { eq }) => eq(table.id, params.postId),
      with: {
        votes: true,
        author: true,
      },
    });
    if (postQuery) {
      post = postQuery;
    }
  }

  if (!post && !cachedPost) return notFound();

  return (
    <div>
      <div className="flex h-full flex-col items-center justify-between sm:flex-row sm:items-start">
        <Suspense fallback={<PostVoteShell />}>
          <PostVoteServer
            postId={post?.id ?? cachedPost.id}
            getData={async () => {
              return (
                (await db.query.posts.findFirst({
                  where: (table, { eq }) => eq(table.id, params.postId),
                  with: {
                    votes: true,
                  },
                })) ?? null
              );
            }}
          />
        </Suspense>

        <div className="w-full flex-1 rounded-sm bg-white p-4 sm:w-0">
          <p className="mt-1 max-h-40 truncate text-xs text-gray-500">
            Posted by u/{post?.author.username ?? cachedPost.authorUsername}{" "}
            {formatTimeToNow(new Date(post?.createdAt ?? cachedPost.createdAt))}
          </p>
          <h1 className="py-2 text-xl font-semibold leading-6 text-gray-900">
            {post?.title ?? cachedPost.title}
          </h1>

          <EditorOutput content={post?.content ?? cachedPost.content} />
          <Suspense
            fallback={<Loader2 className="size-5 animate-spin text-zinc-500" />}
          >
            {/* <CommentsSection postId={post?.id ?? cachedPost.id} /> */}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

function PostVoteShell() {
  return (
    <div className="flex w-20 flex-col items-center pr-6">
      {/* upvote */}
      <div className={buttonVariants({ variant: "ghost" })}>
        <ArrowBigUp className="size-5 text-zinc-700" />
      </div>

      {/* score */}
      <div className="py-2 text-center text-sm font-medium text-zinc-900">
        <Loader2 className="size-3 animate-spin" />
      </div>

      {/* downvote */}
      <div className={buttonVariants({ variant: "ghost" })}>
        <ArrowBigDown className="size-5 text-zinc-700" />
      </div>
    </div>
  );
}

export default SubPorumPostPage;
