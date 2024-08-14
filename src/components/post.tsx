"use client";

import { formatTimeToNow } from "@/lib/utils";
import { Post, User, Vote } from "@/db/schema";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { FC, useRef } from "react";
import EditorOutput from "./editor-output";
import PostVoteClient from "./post-vote/client";

type PartialVote = Pick<Vote, "vote">;

interface PostProps {
  post: Post & {
    author: User;
    votes: Vote[];
  };
  votesAmt: number;
  subporumName: string;
  currentVote?: PartialVote;
  commentAmt: number;
}

const PostComponent: FC<PostProps> = ({
  post,
  votesAmt: _votesAmt,
  currentVote: _currentVote,
  subporumName,
  commentAmt,
}) => {
  const pRef = useRef<HTMLParagraphElement>(null);

  return (
    <div className="rounded-md bg-white shadow">
      <div className="flex justify-between px-6 py-4">
        <PostVoteClient
          postId={post.id}
          initialVotesAmt={_votesAmt}
          initialVote={_currentVote?.vote}
        />

        <div className="w-0 flex-1">
          <div className="mt-1 max-h-40 text-xs text-gray-500">
            {subporumName ? (
              <>
                <a
                  className="text-sm text-zinc-900 underline underline-offset-2"
                  href={`/p/${subporumName}`}
                >
                  p/{subporumName}
                </a>
                <span className="px-1">•</span>
              </>
            ) : null}
            <span>Posted by u/{post.author.username}</span>{" "}
            {formatTimeToNow(new Date(post.createdAt || ""))}
          </div>
          <a href={`/p/${subporumName}/post/${post.id}`}>
            <h1 className="py-2 text-lg font-semibold leading-6 text-gray-900">
              {post.title}
            </h1>
          </a>

          <div
            className="relative max-h-40 w-full overflow-hidden text-clip text-sm"
            ref={pRef}
          >
            <EditorOutput content={post.content} />
            {pRef.current?.clientHeight === 160 ? (
              // blur bottom if content is too long
              <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent"></div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="z-20 bg-gray-50 p-4 text-sm sm:px-6">
        <Link
          href={`/p/${subporumName}/post/${post.id}`}
          className="flex w-fit items-center gap-2"
        >
          <MessageSquare className="size-4" /> {commentAmt} comments
        </Link>
      </div>
    </div>
  );
};
export default PostComponent;
