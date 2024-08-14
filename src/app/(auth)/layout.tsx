import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  // pt:mt-0 mx-auto flex flex-col items-center justify-center px-6 pt-8 dark:bg-gray-900 md:h-screen
  return <div className="grid h-full place-items-center p-4">{children}</div>;
}
