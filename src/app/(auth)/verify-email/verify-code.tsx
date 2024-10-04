"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { useToast } from "@/hooks/use-toast";
import { verifyEmail, resendVerificationEmail as resendEmail } from "./actions";
import { logout } from "@/app/_header/actions";
import { SubmitButton } from "@/components/submit-button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import Link from "next/link";
import { Paths } from "@/lib/constants";

export const VerifyCode = ({
  codeLength,
  userRole,
}: {
  codeLength: number;
  userRole: string;
}) => {
  const { toast } = useToast();
  const [verifyEmailState, verifyEmailAction] = useFormState(verifyEmail, null);
  const [resendState, resendAction] = useFormState(resendEmail, null);
  const codeFormRef = useRef<HTMLFormElement>(null);

  const [otpValue, setOtpValue] = useState("");
  const handleOtpChange = (value: string) => {
    setOtpValue(value);
  };

  const getRedirectLink = () => {
    return userRole === "admin" ? Paths.AdminDashboard : Paths.Home;
  };

  useEffect(() => {
    if (resendState?.success) {
      toast({
        title: "Code resent",
        description: "Check your email for the verification code.",
      });
    }
    if (resendState?.error) {
      toast({
        title: "Error",
        description: resendState.error,
        variant: "destructive",
      });
    }
  }, [resendState?.error, resendState?.success, toast]);

  useEffect(() => {
    if (verifyEmailState?.error) {
      toast({
        title: "Error",
        description: verifyEmailState.error,
        variant: "destructive",
      });
    }
  }, [verifyEmailState?.error, toast]);

  return (
    <div className="flex flex-col gap-2">
      <form ref={codeFormRef} action={verifyEmailAction}>
        <Label htmlFor="code">Verification code</Label>
        <Input className="mt-2" type="hidden" name="code" value={otpValue} />
        <InputOTP
          id="code"
          maxLength={codeLength}
          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
          onChange={handleOtpChange}
        >
          <InputOTPGroup>
            {Array.from({ length: codeLength }, (_, i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <SubmitButton className="mt-4 w-full">Verify</SubmitButton>
      </form>
      <form action={resendAction}>
        <SubmitButton className="w-full" variant="secondary">
          Resend Code
        </SubmitButton>
      </form>
      <form action={logout} className="flex flex-wrap justify-between">
        <SubmitButton
          variant="link"
          className="p-0 text-xs font-medium underline-offset-4 hover:underline"
        >
          Use another email? Log out now.
        </SubmitButton>
        <Button
          variant="link"
          className="p-0 text-xs font-medium underline-offset-4 hover:underline"
        >
          <Link href={getRedirectLink()}>Verify later.</Link>
        </Button>
      </form>
    </div>
  );
};
