"use client";
import Link from "next/link";
import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { RoomeWordmark } from "@/components/ui/Wordmark";
import { useAuthStore } from "@/store/authStore";
import { Avatar } from "@/components/ui/Avatar";

const NAV = [
  { href: "/home", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/messages", label: "Messages" },
  { href: "/friends", label: "Friends" },
  { href: "/listings", label: "Listings" },
  { href: "/notifications", label: "Notifications" },
  { href: "/profile", label: "Profile" },
];

export function TopNav() {
  const { roommateUser } = useAuthStore();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 bg-roome-offwhite border-b border-gray-200">
      <div className="h-14 flex items-center px-4 gap-3">
        <Link href="/home" className="font-black text-xl font-heading text-roome-black flex items-center">
          <RoomeWordmark className="text-xl" />
        </Link>

        <nav className="flex-1 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {NAV.map(({ href, label }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-3 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap",
                    active ? "bg-[#38b6ff] text-white" : "text-roome-black hover:bg-roome-pale/50"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="flex items-center gap-2">
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
        </div>
      </div>
    </header>
  );
}
