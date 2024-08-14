"use client";

import { User } from "lucia";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserAvatar } from "./user-avatar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ImageIcon, Link2 } from "lucide-react";

export default function MiniCreatePost({ user }: { user: User | null }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <li className="overflow-hidden rounded-md bg-white shadow">
      <div className="flex h-full justify-between gap-6 px-6 py-4">
        <div className="relative">
          <UserAvatar
            user={{
              name: user?.username ?? "User",
              image: user?.avatar,
            }}
          />

          <span className="absolute bottom-0 right-0 size-3 rounded-full bg-green-500 outline outline-2 outline-white" />
        </div>
        <Input
          onClick={() => router.push(pathname + "/submit")}
          readOnly
          placeholder="Create post"
        />
        <Button
          onClick={() => router.push(pathname + "/submit")}
          variant="ghost"
        >
          <ImageIcon className="text-zinc-600" />
        </Button>
        <Button
          onClick={() => router.push(pathname + "/submit")}
          variant="ghost"
        >
          <Link2 className="text-zinc-600" />
        </Button>
      </div>
    </li>
  );
}
