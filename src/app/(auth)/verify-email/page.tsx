import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth/validate-request";
import { VerifyCode } from "./verify-code";
import { CODE_LENGTH, Paths } from "@/lib/constants";

export const metadata = {
  title: "Verify Email",
  description: "Verify Email Page",
};

export default async function VerifyEmailPage() {
  const { user } = await validateRequest();

  if (!user) redirect(Paths.Login);
  if (user.emailVerified) {
    if (user.role === "admin") {
      return redirect(Paths.AdminDashboard);
    } else {
      return redirect(Paths.Home);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Verify Email</CardTitle>
        <CardDescription>
          Verification code was sent to <strong>{user.email}</strong>. Check
          your spam folder if you can&apos;t find the email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VerifyCode codeLength={CODE_LENGTH} userRole={user.role} />
      </CardContent>
    </Card>
  );
}
