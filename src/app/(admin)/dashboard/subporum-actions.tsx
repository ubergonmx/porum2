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

import { deleteSubporum } from "./actions";
import { DialogClose } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";

interface SubporumActionsProps {
  subporumId: string;
  subporumName: string;
}

export default function SubporumActions({
  subporumId,
  subporumName,
}: SubporumActionsProps) {
  const router = useRouter();
  const [deleteSubporumId, setDeleteSubporumId] = useState<string>("");

  const handleDeleteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeleteSubporumId(e.target.value);
  };

  const handleDeleteSubporum = async () => {
    await deleteSubporum(subporumId);
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
            <h2>{subporumName}</h2>
            <DialogDescription>
              Delete subporum {subporumId}. Warning: This will also delete all
              posts and comments within this subporum.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subporumId" className="text-right">
                Confirm ID
              </Label>
              <Input
                id="subporumId"
                value={deleteSubporumId}
                placeholder="Type subporum ID to confirm"
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
                disabled={deleteSubporumId !== subporumId}
                onClick={handleDeleteSubporum}
              >
                Delete subporum
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
