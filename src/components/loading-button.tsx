"use client";

import { forwardRef } from "react";
import { AnimatedSpinner } from "@/components/icons";
import { Button, type ButtonProps } from "@/components/ui/button";

import { cn } from "@/lib/utils";

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading = false, className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        {...props}
        disabled={props.disabled ? props.disabled : loading}
        className={cn(className, "relative")}
      >
        {loading ? <AnimatedSpinner className="size-4" /> : null}
        <span className={cn(loading ? "ml-2" : "")}>{children}</span>
      </Button>
    );
  },
);

LoadingButton.displayName = "LoadingButton";

export { LoadingButton };
