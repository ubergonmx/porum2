// import { Editor } from "@/components/editor";
import { Editor } from "@/components/editor";
import { SubmitButton } from "@/components/submit-button";
import { database as db } from "@/db/database";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function SubmitPostPage({ params }: PageProps) {
  const { user } = await validateRequest();

  if (!user) redirect(Paths.Login);

  const subporum = await db.query.subporums.findFirst({
    where: (table, { eq }) => eq(table.name, params.slug),
  });

  if (!subporum) return notFound();

  return (
    <div className="flex flex-col items-start gap-6">
      {/* heading */}
      <div className="border-b border-gray-200 pb-5">
        <div className="-ml-2 -mt-2 flex flex-wrap items-baseline">
          <h3 className="ml-2 mt-2 text-base font-semibold leading-6 text-gray-900">
            Create Post
          </h3>
          <p className="ml-2 mt-1 truncate text-sm text-gray-500">
            in p/{params.slug}
          </p>
        </div>
      </div>

      {/* form */}
      <Editor subporumId={subporum.id} />

      <div className="flex w-full justify-end">
        <SubmitButton className="w-full" form="subporum-post-form">
          Post
        </SubmitButton>
      </div>
    </div>
  );
}
