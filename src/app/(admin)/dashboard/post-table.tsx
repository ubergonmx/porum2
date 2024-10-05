import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PostActions from "./post-actions";

interface PostTableProps {
  posts?: any[];
}

export default async function PostTable({ posts }: PostTableProps) {
  return (
    <Card>
      <CardHeader className="px-7">
        <CardTitle>Posts</CardTitle>
        <CardDescription>List of all posts.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Author</TableHead>
              <TableHead className="hidden md:table-cell">Subporum</TableHead>
              <TableHead className="hidden sm:table-cell">Created At</TableHead>
              <TableHead className="hidden sm:table-cell">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts && posts.length > 0 ? (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="font-medium">
                      {post.title.length > 50
                        ? `${post.title.slice(0, 50)}...`
                        : post.title}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {post.author.username}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {post.subporum.name}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <PostActions postId={post.id} postTitle={post.title} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="bg-accent">
                <TableCell colSpan={5} className="text-center">
                  No posts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
