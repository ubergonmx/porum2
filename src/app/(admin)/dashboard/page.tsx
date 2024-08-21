import UserTable from "@/app/(admin)/dashboard/user-table";
import { fetchUsers } from "./actions";
import { User } from "@/db/schema";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const { user } = await validateRequest();

  if (user) {
    if (user.role !== "admin") {
      return redirect(Paths.Home);
    }
  } else {
    return redirect(Paths.Login);
  }

  // This loads the user database from postgres drizzle-orm
  // uses server actions to get the data using actions.ts
  const users: User[] = await fetchUsers();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <UserTable users={users} />
    </main>
  );
}
