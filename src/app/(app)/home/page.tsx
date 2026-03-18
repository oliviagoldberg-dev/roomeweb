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


    </div>
  );
}
