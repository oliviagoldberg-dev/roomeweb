"use client";
import Link from "next/link";
import { Menu, Bell } from "lucide-react";
import { RoomeWordmark } from "@/components/ui/Wordmark";
import { useAuthStore } from "@/store/authStore";
import { Avatar } from "@/components/ui/Avatar";

interface TopNavProps {
  onMenuToggle: () => void;
}

export function TopNav({ onMenuToggle }: TopNavProps) {
  const { roommateUser } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 bg-roome-offwhite border-b border-gray-200 h-14 flex items-center px-4 gap-3 flex-shrink-0">
      {/* Hamburger button — mobile only */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-xl hover:bg-roome-pale/50 transition-colors text-roome-black"
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Logo — mobile only (desktop shows it in sidebar) */}
      <Link href="/home" className="lg:hidden font-black text-xl font-heading text-roome-black">
        <RoomeWordmark className="text-xl" />
      </Link>

      <div className="flex-1" />

      {/* Right side actions */}
      <Link
        href="/notifications"
        className="p-2 rounded-xl hover:bg-roome-pale/50 transition-colors text-roome-black"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
      </Link>
      <Link href="/profile" className="rounded-full">
        <Avatar
          src={roommateUser?.profileImageURL ?? null}
          name={roommateUser?.name ?? "?"}
          size={32}
        />
      </Link>
    </header>
  );
}
