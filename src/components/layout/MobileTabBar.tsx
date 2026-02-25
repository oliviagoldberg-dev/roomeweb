"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Home, Search, MessageSquare, Users, BookMarked, User } from "lucide-react";

const TABS = [
  { href: "/home",     Icon: Home, label: "Home"     },
  { href: "/browse",   Icon: Search, label: "Browse"   },
  { href: "/messages", Icon: MessageSquare, label: "Messages" },
  { href: "/friends",  Icon: Users, label: "Friends"  },
  { href: "/listings", Icon: BookMarked, label: "Listings" },
  { href: "/profile",  Icon: User, label: "Profile"  },
];

export function MobileTabBar() {
  const pathname = usePathname();
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
