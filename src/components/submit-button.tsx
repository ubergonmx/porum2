"use client";

import { forwardRef } from "react";
import { useFormStatus } from "react-dom";
import { LoadingButton } from "@/components/loading-button";
import type { ButtonProps } from "@/components/ui/button";

// Extend ButtonProps to include custom props
interface SubmitButtonProps extends ButtonProps {
  loading?: boolean;
}

const SubmitButton = forwardRef<HTMLButtonElement, SubmitButtonProps>(
  ({ className, loading, children, ...props }, ref) => {
    const { pending } = useFormStatus();
    const isPending = pending || loading;
    return (
      <LoadingButton
        ref={ref}
        {...props}
        loading={isPending}
        className={className}
      >
        {children}
      </LoadingButton>
    );
  },
);
SubmitButton.displayName = "SubmitButton";

export { SubmitButton };
