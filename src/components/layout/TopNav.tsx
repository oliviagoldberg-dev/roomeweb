"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { RoomeWordmark } from "@/components/ui/Wordmark";
import { useAuthStore } from "@/store/authStore";
import { Avatar } from "@/components/ui/Avatar";

const PREVIEW_UID = "1096b0ff-c05d-48e5-98a7-14bab97826a0";

const ALL_NAV = [
  { href: "/home",          label: "Home",          previewOnly: false },
  { href: "/browse",        label: "Browse",        previewOnly: false },
  { href: "/messages",      label: "Messages",      previewOnly: false },
  { href: "/friends",       label: "Friends",       previewOnly: false },
  { href: "/listings",      label: "Listings",      previewOnly: true },
  { href: "/notifications", label: "Notifications", previewOnly: false },
  { href: "/profile",       label: "Profile",       previewOnly: false },
];

export function TopNav() {
  const { roommateUser, uid } = useAuthStore();
  const pathname = usePathname();
  const NAV = ALL_NAV.filter((t) => !t.previewOnly || uid === PREVIEW_UID);

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
                    "px-3 py-2 text-sm font-semibold transition-colors whitespace-nowrap",
                    active ? "text-[#38b6ff]" : "text-roome-black hover:text-[#38b6ff]"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="flex items-center gap-2">
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
