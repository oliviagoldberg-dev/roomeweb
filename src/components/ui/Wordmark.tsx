"use client";
import { cn } from "@/lib/utils/cn";

interface WordmarkProps {
  className?: string;
  dotClassName?: string;
}

export function RoomeWordmark({ className, dotClassName }: WordmarkProps) {
  return (
    <span className={cn("font-heading font-black text-roome-black", className)}>
      ROOMe
      <span className={cn("text-[#38b6ff]", dotClassName)}>.</span>
    </span>
  );
}
