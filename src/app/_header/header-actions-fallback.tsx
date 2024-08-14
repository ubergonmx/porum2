"use client";

import { Loader2Icon } from "lucide-react";

export function HeaderActionsFallback() {
  return (
    <div className="flex w-40 items-center justify-center">
      <Loader2Icon className="size-4 animate-spin" />
    </div>
  );
}
