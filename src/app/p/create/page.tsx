import CreateSubPorum from "./create-subporum";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";

export default async function CreatePage() {
  const { user } = await validateRequest();

  if (!user) redirect(Paths.Login);

  return (
    <div className="container mx-auto flex h-full max-w-3xl items-center">
      <CreateSubPorum />
    </div>
  );
}
