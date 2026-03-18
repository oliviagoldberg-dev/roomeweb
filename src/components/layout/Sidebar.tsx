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
import { useConversations } from "@/hooks/useConversations";
import { cn } from "@/lib/utils/cn";
import { RoomeWordmark } from "@/components/ui/Wordmark";

const NAV = [
  { href: "/home",          label: "Home",          Icon: Home },
  { href: "/browse",        label: "Browse",        Icon: Search },
  { href: "/messages",      label: "Messages",      Icon: MessageSquare },
  { href: "/friends",       label: "Friends",       Icon: Users },
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
  const { clear, uid } = useAuthStore();
  const { convos } = useConversations();
  const unreadTotal = convos.reduce((sum, c) => sum + (c.unreadCount?.[uid ?? ""] ?? 0), 0);

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
          const showBadge = label === "Messages" && unreadTotal > 0;
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
              <span className="flex-1">{label}</span>
              {showBadge && (
                <span className="min-w-[18px] h-[18px] bg-white text-roome-core text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadTotal}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 pb-4 flex items-center gap-4">
        <a href="https://instagram.com/theroomeofficial" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-[#38b6ff] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
        </a>
        <a href="https://tiktok.com/@theroomeofficial" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-gray-400 hover:text-[#38b6ff] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
          </svg>
        </a>
        <a href="https://facebook.com/ROOMe" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-400 hover:text-[#38b6ff] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
          </svg>
        </a>
      </div>
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
