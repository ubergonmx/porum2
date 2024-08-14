"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { SubmitButton } from "@/components/submit-button";
import Link from "next/link";
import { LoginInput, loginSchema } from "@/lib/validators/auth";
import { login } from "./actions";
import { APP_TITLE } from "@/lib/constants";
import { useState, useTransition } from "react";
type FormFieldKey = "email" | "password";
export default function Login() {
  const [isPending, startTransition] = useTransition();
  const [loginError, setLoginError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: LoginInput) {
    startTransition(() => {
      setLoginError(null);
      login(values).then((result) => {
        if (result?.fieldError) {
          Object.entries(result.fieldError).forEach(([field, message]) => {
            form.setError(field as FormFieldKey, {
              type: "manual",
              message,
            });
          });
        }
        if (result?.formError) setLoginError(result.formError);
      });
    });
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>{APP_TITLE} Log in</CardTitle>
        <CardDescription>Welcome back!</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="juandelacruz@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="current-password"
                      placeholder="********"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {loginError && (
              <p className="rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
                {loginError}
              </p>
            )}
            <div className="flex flex-wrap justify-between">
              <Link href={"/signup"}>
                <span className="p-0 text-xs font-medium underline-offset-4 hover:underline">
                  Not signed up? Sign up now.
                </span>
              </Link>
              <Link href={"/reset-password"}>
                <span className="p-0 text-xs font-medium underline-offset-4 hover:underline">
                  Forgot password?
                </span>
              </Link>
            </div>
            <SubmitButton className="w-full" loading={isPending}>
              Log In
            </SubmitButton>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">Cancel</Link>
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
