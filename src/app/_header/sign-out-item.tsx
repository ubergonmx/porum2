"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LogOutIcon } from "lucide-react";
import { logout } from "./actions";

export function SignOutItem() {
  return (
    <DropdownMenuItem
      className="cursor-pointer"
      onSelect={async () => {
        logout();
      }}
    >
      <LogOutIcon className="mr-2 size-4" />
      Logout
    </DropdownMenuItem>
  );
}
