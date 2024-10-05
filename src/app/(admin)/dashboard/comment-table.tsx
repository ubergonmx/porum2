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
import CommentActions from "./comment-actions";

interface CommentTableProps {
  comments?: any[];
}

export default async function CommentTable({ comments }: CommentTableProps) {
  return (
    <Card>
      <CardHeader className="px-7">
        <CardTitle>Comments</CardTitle>
        <CardDescription>List of all comments.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content</TableHead>
              <TableHead className="hidden md:table-cell">Author</TableHead>
              <TableHead className="hidden md:table-cell">Post</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden sm:table-cell">Created At</TableHead>
              <TableHead className="hidden sm:table-cell">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell>
                    <div className="font-medium">
                      {comment.content.length > 50
                        ? `${comment.content.slice(0, 50)}...`
                        : comment.content}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {comment.author.username}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {comment.post.title.length > 30
                      ? `${comment.post.title.slice(0, 30)}...`
                      : comment.post.title}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {comment.deleted === "true" ? (
                      <span className="text-red-500">Deleted</span>
                    ) : (
                      <span className="text-green-500">Active</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {comment.createdAt
                      ? new Date(comment.createdAt).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <CommentActions
                      commentId={comment.id}
                      commentContent={comment.content}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="bg-accent">
                <TableCell colSpan={6} className="text-center">
                  No comments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
