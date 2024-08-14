import SubscribeLeaveToggle from "@/app/p/[slug]/subscribe-leave-toggle";
// import ToFeedButton from "@/components/ToFeedButton";
import { buttonVariants } from "@/components/ui/button";
import { validateRequest } from "@/lib/auth/validate-request";
import { database as db } from "@/db/database";
import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import { and } from "drizzle-orm";
import { Card, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Layout = async ({
  children,
  params: { slug },
}: {
  children: ReactNode;
  params: { slug: string };
}) => {
  const { user } = await validateRequest();

  const subporum = await db.query.subporums.findFirst({
    where: (table, { eq }) => eq(table.name, slug),
    with: {
      posts: {
        with: {
          author: true,
          votes: true,
        },
      },
      subscribers: true,
    },
  });

  let subscription = null;
  let memberCount = 0;
  if (user && subporum) {
    subscription = await db.query.subscriptions.findFirst({
      where: (table, { eq }) =>
        and(eq(table.subporumId, subporum.id), eq(table.userId, user.id)),
    });
    memberCount = subporum.subscribers.length || 0;
  }

  const isSubscribed = !!subscription;

  if (!subporum) return notFound();

  return (
    // <div className="mx-auto h-full max-w-7xl pt-12 sm:container">
    <>
      {/* <ToFeedButton /> */}

      <div className="grid grid-cols-1 gap-y-4 py-6 md:grid-cols-3 md:gap-x-4">
        <ul className="col-span-2 flex flex-col space-y-6">{children}</ul>

        {/* info sidebar */}
        <Card className="order-first h-fit overflow-hidden md:order-last">
          <CardHeader className="px-6 py-4">
            <p className="py-3 font-semibold">About p/{subporum.name}</p>
          </CardHeader>
          <dl className="divide-gray-100 bg-white px-6 py-4 text-sm leading-6">
            <div className="flex justify-between gap-x-4 py-3">
              <dt className="text-gray-500">Created</dt>
              <dd className="text-gray-700">
                {subporum.createdAt ? (
                  <>
                    <time dateTime={subporum.createdAt.toDateString()}>
                      {format(subporum.createdAt, "MMMM d, yyyy")}
                    </time>
                  </>
                ) : (
                  "Date not provided"
                )}
              </dd>
            </div>
            <Separator />
            <div className="flex justify-between gap-x-4 py-3">
              <dt className="text-gray-500">Members</dt>
              <dd className="flex items-start gap-x-2">
                <div className="text-gray-900">{memberCount}</div>
              </dd>
            </div>
            <Separator />
            <div className="flex justify-between gap-x-4 py-3">
              <dt className="text-gray-500">Minimum days to join</dt>
              <dd className="flex items-start gap-x-2">
                <div className="text-gray-900">{subporum.minimumDays}</div>
              </dd>
            </div>
            {subporum.userId === user?.id ? (
              <>
                <Separator />
                <div className="flex justify-between gap-x-4 py-3">
                  <dt className="text-gray-500">You created this community</dt>
                </div>
              </>
            ) : null}

            {subporum.userId !== user?.id ? (
              <SubscribeLeaveToggle
                isSubscribed={isSubscribed}
                subporumId={subporum.id}
                subporumName={subporum.name}
                minimumDays={subporum.minimumDays}
                createdAt={subporum.createdAt!}
              />
            ) : null}
            <Link
              className={buttonVariants({
                variant: "outline",
                className: "w-full mb-6",
              })}
              href={`/p/${slug}/submit`}
            >
              Create Post
            </Link>
          </dl>
        </Card>
      </div>
    </>
    // </div>
  );
};

export default Layout;
