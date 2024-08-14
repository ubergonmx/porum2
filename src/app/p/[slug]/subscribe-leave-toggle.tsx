"use client";

import { SubmitButton } from "@/components/submit-button";
import { useToast } from "@/components/ui/use-toast";
import { useTransition } from "react";
import { subscribeSubporum, unsubscribeSubporum } from "./actions";
import { useRouter } from "next/navigation";

interface SubscribeLeaveToggleProps {
  isSubscribed: boolean;
  subporumId: string;
  subporumName: string;
  minimumDays: number;
  createdAt: Date;
}

export default function SubscribeLeaveToggle({
  isSubscribed,
  subporumId,
  subporumName,
  minimumDays,
  createdAt,
}: SubscribeLeaveToggleProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function unsubscribe() {
    startTransition(() => {
      unsubscribeSubporum({ subporumId, minimumDays, createdAt }).then(
        (result) => {
          if (result?.formError) {
            toast({
              title: "Error",
              description: result.formError,
              variant: "destructive",
            });
          }
          if (result?.success) {
            toast({
              title: "Unsubscribed",
              description: `You have left p/${subporumName}`,
            });
            router.refresh();
          }
        },
      );
    });
  }

  function subscribe() {
    startTransition(() => {
      subscribeSubporum({ subporumId, minimumDays, createdAt }).then(
        (result) => {
          if (result?.formError) {
            toast({
              title: "Error",
              description: result.formError,
              variant: "destructive",
            });
          }
          if (result?.success) {
            toast({
              title: "Subscribed",
              description: `You have joined p/${subporumName}`,
            });
            router.refresh();
          }
        },
      );
    });
  }

  return isSubscribed ? (
    <SubmitButton
      className="mb-4 mt-1 w-full"
      loading={isPending}
      onClick={() => unsubscribe()}
    >
      Leave community
    </SubmitButton>
  ) : (
    <SubmitButton
      className="mb-4 mt-1 w-full"
      loading={isPending}
      onClick={() => subscribe()}
    >
      Join to post
    </SubmitButton>
  );
}
