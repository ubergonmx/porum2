import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import AvatarUploadChunk from "./avatar-upload";
import Image from "next/image";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";
import defaultAvatar from "@/assets/avatars/defaultAvatar.png";
import { format } from "date-fns";

export default async function Settings() {
  const { user } = await validateRequest();

  if (!user) redirect(Paths.Login);
  const dateJoined = user?.createdAt
    ? format(user.createdAt, "MMMM dd, yyyy")
    : "(unknown)";

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 md:gap-8">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold">Settings</h1>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
          <nav
            className="grid gap-4 text-sm text-muted-foreground"
            x-chunk="dashboard-04-chunk-0"
          >
            <Link href="#" className="font-semibold text-primary">
              Account Settings
            </Link>
          </nav>
          <div className="grid gap-6">
            <Card x-chunk="dashboard-04-chunk-1">
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Account Details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <Image
                        src={user.avatar ?? defaultAvatar}
                        alt="User Avatar"
                        width={64}
                        height={64}
                        className="size-32 rounded-full"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <span>
                        Username: <strong>{user.username}</strong>
                      </span>
                      <span>
                        Email: <strong>{user.email}</strong>
                      </span>
                      <span>
                        Role: <strong>{user.role}</strong>
                      </span>
                      <span>
                        Date Joined: <strong>{dateJoined}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button>Save</Button>
              </CardFooter>
            </Card>
            <Card x-chunk="dashboard-04-chunk-2">
              <AvatarUploadChunk />
            </Card>
            <Card x-chunk="dashboard-04-chunk-3">
              <CardHeader>
                <CardTitle>Delete my account</CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="flex flex-col gap-4">
                  <Input
                    id="delete-account-pwd"
                    placeholder="Type your password to confirm"
                  />

                  <div className="flex items-center space-x-2">
                    <Checkbox id="delete-account" />
                    <label
                      htmlFor="delete-account"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I understand that this action is irreversible.
                    </label>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button variant="destructive" disabled>
                  Delete Account
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
