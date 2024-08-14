import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { APP_TITLE } from "@/lib/constants";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import Header from "./_header/header";
import ReactQueryProvider from "./providers/react-query-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: APP_TITLE,
    template: `%s | ${APP_TITLE}`,
  },
  description: "Connect, Share, Discover",
  icons: [{ rel: "icon", url: "/icon.png" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "bg-white text-slate-900 antialiased light",
        inter.className,
      )}
    >
      <body className="flex min-h-screen w-full flex-col bg-slate-50 antialiased">
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />

        <ReactQueryProvider>
          <Header />
          <div className="container mx-auto h-full max-w-7xl pt-12">
            {children}
          </div>
        </ReactQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
