import React from "react";
import { ReactNode } from "react";
import Navigation from "./Navigation";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />
      <main className={cn(
        "flex-1 w-full",
        "px-4 py-1 sm:py-2 md:py-4", // Adjusted padding
        "mx-auto max-w-[90rem]",
        "transition-all duration-300 ease-in-out"
      )}>
        {children}
      </main>
    </div>
  );
}