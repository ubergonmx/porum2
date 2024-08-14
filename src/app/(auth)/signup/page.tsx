import SignUp from "./signup";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";

export default async function SignupPage() {
  const { user } = await validateRequest();

  if (user) {
    if (user.role === "admin") {
      return redirect(Paths.AdminDashboard);
    } else {
      return redirect(Paths.Home);
    }
  }

  return <SignUp />;
}
