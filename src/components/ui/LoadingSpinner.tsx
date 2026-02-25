import { cn } from "@/lib/utils/cn";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-8 h-8 border-4 border-roome-glow/30 border-t-roome-glow rounded-full animate-spin",
        className
      )}
    />
  );
}
