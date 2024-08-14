"use client";

import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { CreateSubporumInput, subporumSchema } from "@/lib/validators/subporum";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { createSubporum } from "./actions";
import Link from "next/link";
import { Paths } from "@/lib/constants";

type FormFieldKey = "name" | "minimumDays";
export default function CreateSubPorum() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<CreateSubporumInput>({
    resolver: zodResolver(subporumSchema),
    defaultValues: {
      name: "",
    },
  });

  function onSubmit(values: CreateSubporumInput) {
    startTransition(() => {
      createSubporum(values).then((result) => {
        if (result?.fieldError) {
          Object.entries(result.fieldError).forEach(([field, message]) => {
            form.setError(field as FormFieldKey, {
              type: "manual",
              message,
            });
          });
        }
        if (result?.formError) {
          toast({
            title: "Error",
            description: result.formError,
            variant: "destructive",
          });
        }
        if (result?.success) {
          toast({
            title: "Subporum Created",
            description: "Your subporum has been created.",
          });

          // Redirect to the new subporum
          const redirect = result.redirect ?? values.name;
          router.push(`/p/${redirect}`);
        }
      });
    });
  }
  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Create a Community</CardTitle>
        <CardDescription>
          Make your own subporum and start a community.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input id="name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Community names including capitalization cannot be changed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minimumDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum days</FormLabel>
                  <FormControl>
                    <Input id="minimumDays" {...field} type="number" />
                  </FormControl>
                  <FormDescription>
                    Minimum number of days a user must be registered to post.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="justify-between space-x-2">
            <Button variant="secondary" asChild>
              <Link href={Paths.Home}>Cancel</Link>
            </Button>
            <SubmitButton loading={isPending}>Submit</SubmitButton>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
