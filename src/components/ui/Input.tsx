"use client";
import React from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-600">{label}</label>}
      <input
        {...props}
        className={cn(
          "w-full px-4 py-3 rounded-2xl bg-roome-offwhite text-roome-black placeholder-gray-400 border border-transparent",
          "focus:outline-none focus:ring-2 focus:ring-roome-core/40 focus:border-roome-core/30 focus:bg-white transition",
          error && "ring-2 ring-red-400",
          className
        )}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
