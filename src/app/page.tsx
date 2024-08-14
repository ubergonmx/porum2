import CustomFeed from "@/components/homepage/custom-feed";
import GeneralFeed from "@/components/homepage/general-feed";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { HomeIcon } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function Home() {
  const { user } = await validateRequest();

  return (
    <>
      <h1 className="text-3xl font-bold md:text-4xl">Your feed</h1>
      <div className="grid grid-cols-1 gap-y-4 py-6 md:grid-cols-3 md:gap-x-4">
        {user ? <CustomFeed /> : <GeneralFeed />}

        {/* subporum info */}
        <Card className="order-first h-fit overflow-hidden md:order-last">
          <CardHeader className="bg-emerald-100 px-6 py-4">
            <p className="flex items-center gap-1.5 py-3 font-semibold">
              <HomeIcon className="size-4" />
              Home
            </p>
          </CardHeader>
          <CardContent className="py-2 text-sm leading-6">
            <div className="flex justify-between gap-x-4 py-3">
              <p className="text-zinc-500">
                Your personal Porum front-page. Come here to check in with your
                favorite communities.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Link
              className={buttonVariants({
                className: "w-full",
              })}
              href={Paths.CreateSubporum}
            >
              Create Community
            </Link>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
