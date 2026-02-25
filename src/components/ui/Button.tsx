"use client";
import React from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:   "bg-roome-core text-white hover:bg-roome-deep disabled:opacity-50",
  secondary: "bg-roome-core/10 text-roome-core hover:bg-roome-core/20",
  ghost:     "bg-transparent text-roome-core hover:bg-roome-core/10",
  danger:    "bg-red-500 text-white hover:bg-red-600",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-xl",
  md: "px-5 py-2.5 text-sm rounded-2xl",
  lg: "px-6 py-3 text-base rounded-2xl",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-roome-core/50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading…
        </span>
      ) : children}
    </button>
  );
}
