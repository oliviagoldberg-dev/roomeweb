"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Home, Search, MessageSquare, Users, BookMarked, User } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const PREVIEW_UID = "1096b0ff-c05d-48e5-98a7-14bab97826a0";

const ALL_TABS = [
  { href: "/home",     Icon: Home, label: "Home",     previewOnly: false },
  { href: "/browse",   Icon: Search, label: "Browse",   previewOnly: false },
  { href: "/messages", Icon: MessageSquare, label: "Messages", previewOnly: false },
  { href: "/friends",  Icon: Users, label: "Friends",  previewOnly: false },
  { href: "/listings", Icon: BookMarked, label: "Listings", previewOnly: true },
  { href: "/profile",  Icon: User, label: "Profile",  previewOnly: false },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const { uid } = useAuthStore();
  const TABS = ALL_TABS.filter((t) => !t.previewOnly || uid === PREVIEW_UID);
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-roome-offwhite border-t border-gray-200 z-50 flex">
      {TABS.map(({ href, Icon, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors",
              active ? "text-[#38b6ff]" : "text-gray-400"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[9px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
