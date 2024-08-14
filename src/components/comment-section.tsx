// import { database as db } from "@/db/database";
// import { Comment, CommentVote, User } from "@/db/schema";
// import CreateComment from "./CreateComment";
// import PostComment from "./comments/PostComment";
// import { validateRequest } from "@/lib/auth/validate-request";

// type ReplyComment = Comment & {
//   votes: CommentVote[];
//   author: User;
// };

// type ExtendedComment = Comment & {
//   votes: CommentVote[];
//   author: User;
//   replies: ReplyComment[];
// };

// interface CommentsSectionProps {
//   postId: string;
//   comments: ExtendedComment[];
// }

// const CommentsSection = async ({ postId }: CommentsSectionProps) => {
//   const { user } = await validateRequest();

//   const comments = await db.query.comments.findMany({
//     where: (comments, { and, eq, isNull }) =>
//       and(eq(comments.postId, postId), isNull(comments.replyToId)),
//     with: {
//       author: true,
//       votes: true,
//       replies: {
//         with: {
//           author: true,
//           votes: true,
//         },
//       },
//     },
//   });

//   return (
//     <div className="mt-4 flex flex-col gap-y-4">
//       <hr className="my-6 h-px w-full" />

//       <CreateComment postId={postId} />

//       <div className="mt-4 flex flex-col gap-y-6">
//         {comments
//           .filter((comment) => !comment.replyToId)
//           .map((topLevelComment) => {
//             const topLevelCommentVotesAmt = topLevelComment.votes.reduce(
//               (acc, vote) => {
//                 if (vote.vote === "up") return acc + 1;
//                 if (vote.vote === "down") return acc - 1;
//                 return acc;
//               },
//               0
//             );

//             const topLevelCommentVote = topLevelComment.votes.find(
//               (vote) => vote.userId === user?.id
//             );

//             return (
//               <div key={topLevelComment.id} className="flex flex-col">
//                 <div className="mb-2">
//                   <PostComment
//                     comment={topLevelComment}
//                     currentVote={topLevelCommentVote}
//                     votesAmt={topLevelCommentVotesAmt}
//                     postId={postId}
//                   />
//                 </div>

//                 {/* Render replies */}
//                 {topLevelComment.replies
//                   .sort((a, b) => b.votes.length - a.votes.length) // Sort replies by most liked
//                   .map((reply) => {
//                     const replyVotesAmt = reply.votes.reduce((acc, vote) => {
//                       if (vote.vote === "up") return acc + 1;
//                       if (vote.vote === "down") return acc - 1;
//                       return acc;
//                     }, 0);

//                     const replyVote = reply.votes.find(
//                       (vote) => vote.userId === user?.id
//                     );

//                     return (
//                       <div
//                         key={reply.id}
//                         className="ml-2 border-l-2 border-zinc-200 py-2 pl-4"
//                       >
//                         <PostComment
//                           comment={reply}
//                           currentVote={replyVote}
//                           votesAmt={replyVotesAmt}
//                           postId={postId}
//                         />
//                       </div>
//                     );
//                   })}
//               </div>
//             );
//           })}
//       </div>
//     </div>
//   );
// };

// export default CommentsSection;
