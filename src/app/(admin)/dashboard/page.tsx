import UserTable from "@/app/(admin)/dashboard/user-table";
import SubporumTable from "@/app/(admin)/dashboard/subporum-table";
import PostTable from "@/app/(admin)/dashboard/post-table";
import CommentTable from "@/app/(admin)/dashboard/comment-table";
import {
  fetchUsers,
  fetchSubporums,
  fetchPosts,
  fetchComments,
} from "./actions";
import { User } from "@/db/schema";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const { user } = await validateRequest();

  if (user) {
    if (user.role !== "admin") {
      return redirect(Paths.Home);
    }
  } else {
    return redirect(Paths.Login);
  }

  // This loads the databases from postgres drizzle-orm
  // uses server actions to get the data using actions.ts
  const users: User[] = await fetchUsers();
  const subporums = await fetchSubporums();
  const posts = await fetchPosts();
  const comments = await fetchComments();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <UserTable users={users} />
      <SubporumTable subporums={subporums} />
      <PostTable posts={posts} />
      <CommentTable comments={comments} />
    </main>
  );
}
