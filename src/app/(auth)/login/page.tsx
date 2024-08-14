import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";
import Login from "./login";

export default async function LoginPage() {
  const { user } = await validateRequest();

  if (user) {
    if (user.role === "admin") {
      return redirect(Paths.AdminDashboard);
    } else {
      return redirect(Paths.Home);
    }
  }

  return <Login />;
}
