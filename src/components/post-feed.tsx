import { ExtendedPost } from "@/lib/types/db";
import PostComponent from "./post";
import { validateRequest } from "@/lib/auth/validate-request";

interface PostFeedProps {
  initialPosts: ExtendedPost[];
  subporumName?: string;
}

export default async function PostFeed({
  initialPosts: posts,
  subporumName,
}: PostFeedProps) {
  const { user } = await validateRequest();

  return (
    <ul className="col-span-2 flex flex-col space-y-6">
      {posts.map((post, index) => {
        const votesAmt = post.votes.reduce((acc, vote) => {
          if (vote.vote === "up") return acc + 1;
          if (vote.vote === "down") return acc - 1;
          return acc;
        }, 0);

        const currentVote = post.votes.find(
          (vote: { userId: any }) => vote.userId === user?.id,
        );

        return (
          <PostComponent
            key={post.id}
            post={post}
            commentAmt={post.comments.length}
            subporumName={post.subporum.name}
            votesAmt={votesAmt}
            currentVote={currentVote}
          />
        );
      })}
    </ul>
  );
}
