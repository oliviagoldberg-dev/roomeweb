"use client";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}

export function Avatar({ src, name, size = 48, className }: AvatarProps) {
  const initials = name.trim().charAt(0).toUpperCase();

  if (src) {
    return (
      <div
        className={cn("relative rounded-full overflow-hidden flex-shrink-0", className)}
        style={{ width: size, height: size }}
      >
        <Image src={src} alt={name} fill className="object-cover" sizes={`${size}px`} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-roome-pale flex items-center justify-center flex-shrink-0",
        className
      )}
      style={{ width: size, height: size }}
    >
      <span
        className="font-semibold text-roome-deep"
        style={{ fontSize: size * 0.38 }}
      >
        {initials}
      </span>
    </div>
  );
}
