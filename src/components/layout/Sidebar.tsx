"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Search,
  MessageSquare,
  Users,
  BookMarked,
  Bell,
  User,
  LogOut,
} from "lucide-react";
import { signOut } from "@/lib/firebase/auth";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils/cn";
import { RoomeWordmark } from "@/components/ui/Wordmark";

const NAV = [
  { href: "/home",          label: "Home",          Icon: Home },
  { href: "/browse",        label: "Browse",        Icon: Search },
  { href: "/messages",      label: "Messages",      Icon: MessageSquare },
  { href: "/friends",       label: "Friends",       Icon: Users },
  { href: "/listings",      label: "Listings",      Icon: BookMarked },
  { href: "/notifications", label: "Notifications", Icon: Bell },
  { href: "/profile",       label: "Profile",       Icon: User },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { clear } = useAuthStore();

  async function handleSignOut() {
    await signOut();
    clear();
    router.push("/login");
  }

  const content = (
    <div className="flex flex-col w-64 h-full bg-roome-offwhite border-r border-gray-200">
      <div className="px-6 py-6 border-b border-gray-200">
        <RoomeWordmark className="text-3xl" />
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-colors",
                active
                  ? "bg-[#38b6ff] text-white"
                  : "text-roome-black hover:bg-roome-pale/50"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-6">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:bg-red-50 hover:text-red-500 font-medium transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden lg:flex flex-shrink-0 h-full">
        {content}
      </div>

      {/* Mobile: slide-in drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="relative z-50">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
