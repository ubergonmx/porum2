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

import { deletePost } from "./actions";
import { DialogClose } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";

interface PostActionsProps {
  postId: string;
  postTitle: string;
}

export default function PostActions({ postId, postTitle }: PostActionsProps) {
  const router = useRouter();
  const [deletePostId, setDeletePostId] = useState<string>("");

  const handleDeleteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeletePostId(e.target.value);
  };

  const handleDeletePost = async () => {
    await deletePost(postId);
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
            <h2 className="truncate">{postTitle}</h2>
            <DialogDescription>
              Delete post {postId}. Warning: This will also delete all comments
              on this post.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="postId" className="text-right">
                Confirm ID
              </Label>
              <Input
                id="postId"
                value={deletePostId}
                placeholder="Type post ID to confirm"
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
                disabled={deletePostId !== postId}
                onClick={handleDeletePost}
              >
                Delete post
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
