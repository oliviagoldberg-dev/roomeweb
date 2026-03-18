"use client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import Link from "next/link";
import {
  Search,
  MessageSquare,
  Users,
  User,
  Bell,
  DollarSign,
} from "lucide-react";
import { RoomeWordmark } from "@/components/ui/Wordmark";

export default function HomePage() {
  const { user, loading } = useCurrentUser();

  if (loading) return <div className="flex justify-center pt-20"><LoadingSpinner /></div>;

  const greeting = user?.name ? `Hey, ${user.name.split(" ")[0]}!` : null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      <h1 className="text-3xl font-black text-gray-900">
        {greeting ?? (
          <>
            Welcome to <RoomeWordmark />
          </>
        )}
      </h1>
      {user?.city && (
        <p className="text-gray-500">Looking for roommates in <span className="font-semibold text-roome-core">{user.city}</span></p>
      )}

      <div className="grid grid-cols-2 gap-4">
        {[
          { href: "/browse",        Icon: Search,        title: "Browse",        desc: "Find your roommate" },
          { href: "/messages",      Icon: MessageSquare, title: "Messages",      desc: "Chat with your connections" },
          { href: "/friends",       Icon: Users,         title: "Friends",       desc: "Grow your network" },
          { href: "/notifications", Icon: Bell,          title: "Notifications", desc: "See updates and alerts" },
          { href: "/profile",       Icon: User,          title: "Profile",       desc: "Manage your profile" },
        ].map(({ href, Icon, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2"
          >
            <Icon className="w-6 h-6 text-roome-core" />
            <p className="font-bold text-gray-900">{title}</p>
            <p className="text-xs text-gray-500">{desc}</p>
          </Link>
        ))}
        {user && (
          <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-2">
            <DollarSign className="w-6 h-6 text-roome-core" />
            <p className="font-bold text-gray-900">Your budget</p>
            <p className="text-xs text-gray-500">
              ${user.budgetMin?.toLocaleString()} – ${user.budgetMax?.toLocaleString()}/mo
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-5 pt-2">
        <a href="https://instagram.com/theroomeofficial" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-[#38b6ff] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
        </a>
        <a href="https://tiktok.com/@theroomeofficial" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-gray-400 hover:text-[#38b6ff] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
          </svg>
        </a>
        <a href="https://facebook.com/ROOMe" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-400 hover:text-[#38b6ff] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
          </svg>
        </a>
      </div>
    </div>
  );
}
