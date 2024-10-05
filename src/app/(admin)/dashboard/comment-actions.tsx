"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTrigger,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Delete } from "lucide-react";
import React, { useState } from "react";

import { deleteComment } from "./actions";
import { DialogClose } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";

interface CommentActionsProps {
  commentId: string;
  commentContent: string;
}

export default function CommentActions({
  commentId,
  commentContent,
}: CommentActionsProps) {
  const router = useRouter();
  const [deleteCommentId, setDeleteCommentId] = useState<string>("");

  const handleDeleteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeleteCommentId(e.target.value);
  };

  const handleDeleteComment = async () => {
    await deleteComment(commentId);
    router.refresh();
  };

  return (
    <div className="flex gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive" size="icon">
            <Delete className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <h2 className="truncate">
              {commentContent.length > 50
                ? `${commentContent.slice(0, 50)}...`
                : commentContent}
            </h2>
            <DialogDescription>
              Delete comment {commentId}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="commentId" className="text-right">
                Confirm ID
              </Label>
              <Input
                id="commentId"
                value={deleteCommentId}
                placeholder="Type comment ID to confirm"
                className="col-span-3"
                onChange={handleDeleteChange}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="destructive"
                type="submit"
                disabled={deleteCommentId !== commentId}
                onClick={handleDeleteComment}
              >
                Delete comment
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
