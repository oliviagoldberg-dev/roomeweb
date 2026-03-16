"use client";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}

export function Avatar({ src, name, size = 48, className }: AvatarProps) {
  const initials = name.trim().charAt(0).toUpperCase();
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div
      className={cn("rounded-full bg-roome-pale flex items-center justify-center flex-shrink-0 overflow-hidden", className)}
      style={{ width: size, height: size }}
    >
      {src && !imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className="font-semibold text-roome-deep" style={{ fontSize: size * 0.38 }}>
          {initials}
        </span>
      )}
    </div>
  );
}
