import type { Post, Vote } from "@/db/schema";
import { notFound } from "next/navigation";
import PostVoteClient from "./client";
import { validateRequest } from "@/lib/auth/validate-request";

interface PostVoteServerProps {
  postId: string;
  initialVotesAmt?: number;
  initialVote?: Vote["vote"] | null;
  getData?: () => Promise<(Post & { votes: Vote[] }) | null>;
}

/**
 * We split the PostVotes into a client and a server component to allow for dynamic data
 * fetching inside of this component, allowing for faster page loads via suspense streaming.
 * We also have to option to fetch this info on a page-level and pass it in.
 *
 */

const PostVoteServer = async ({
  postId,
  initialVotesAmt,
  initialVote,
  getData,
}: PostVoteServerProps) => {
  const { user } = await validateRequest();

  let _votesAmt: number = 0;
  let _currentVote: Vote["vote"] | null | undefined;

  if (getData) {
    // fetch data in component
    const post = await getData();
    if (!post) return notFound();

    _votesAmt = post.votes.reduce((acc, vote) => {
      if (vote.vote === "up") return acc + 1;
      if (vote.vote === "down") return acc - 1;
      return acc;
    }, 0);

    _currentVote = post.votes.find((vote) => vote.userId === user?.id)?.vote;
  } else {
    // passed as props
    _votesAmt = initialVotesAmt!;
    _currentVote = initialVote;
  }

  return (
    <PostVoteClient
      postId={postId}
      initialVotesAmt={_votesAmt}
      initialVote={_currentVote}
    />
  );
};

export default PostVoteServer;
