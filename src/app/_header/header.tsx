import { APP_TITLE, Paths } from "@/lib/constants";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { validateRequest } from "@/lib/auth/validate-request";
import { UserAvatar } from "@/components/user-avatar";
import { SignOutItem } from "./sign-out-item";
import { Suspense } from "react";
import { HeaderActionsFallback } from "./header-actions-fallback";
import LottiePlayer from "@/components/lazy-lottie";
import iconAnimation from "@/assets/icon.json";

export default async function Header() {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="container mx-auto flex h-full max-w-7xl items-center justify-between gap-2">
        <Link
          href={Paths.Home}
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          {/* <Image
            className="size-8 rounded"
            width="50"
            height="50"
            src={icon}
            alt="logo"
          /> */}
          <LottiePlayer
            animationData={iconAnimation}
            style={{ width: "50px", height: "50px" }}
          />
          <span className="hidden text-sm font-medium text-zinc-700 md:block">
            {APP_TITLE}
          </span>
        </Link>
        <SearchBar />
        <Suspense fallback={<HeaderActionsFallback />}>
          <HeaderActions />
        </Suspense>
      </nav>
    </header>
  );

  async function SearchBar() {
    const { user } = await validateRequest();
    const isSignedIn = !!user;

    if (!isSignedIn) return null;

    return (
      <form className="ml-auto flex-1 sm:flex-initial">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search posts..."
            className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
          />
        </div>
      </form>
    );
  }
}

async function HeaderActions() {
  const { user } = await validateRequest();
  const isSignedIn = !!user;

  return (
    <>
      {isSignedIn ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <UserAvatar user={{ image: user.avatar, name: user.username }} />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                {user.username && (
                  <p className="font-medium">{user.username}</p>
                )}
                {user.email && (
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/">Feed</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={Paths.CreateSubporum}>Create Community</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <SignOutItem />
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button asChild>
          <Link href={Paths.Login}>Log in</Link>
        </Button>
      )}
    </>
  );
}
