"use client";
import { useEffect, useState } from "react";
import { AppNotification } from "@/types/notifications";
import { formatRelative } from "@/lib/utils/formatTime";
import { cn } from "@/lib/utils/cn";
import { Bell, Check, MessageSquare, Sparkles, Users, Megaphone } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  match:           Sparkles,
  friend_request:  Users,
  friend_accepted: Check,
  message:         MessageSquare,
  system:          Megaphone,
};

interface NotificationRowProps {
  notification: AppNotification;
}

export function NotificationRow({ notification: n }: NotificationRowProps) {
  const Icon = TYPE_ICONS[n.type] ?? Bell;
  const time = n.createdAt ? formatRelative(new Date(n.createdAt)) : "";
  const [body, setBody] = useState(n.body);

  useEffect(() => {
    if ((n.type === "friend_accepted" || n.type === "friend_request") && n.fromUID) {
      supabase
        .from("profiles")
        .select("name, username")
        .eq("id", n.fromUID)
        .single()
        .then(({ data }) => {
          const name = data?.name || data?.username;
          if (!name) return;
          if (n.type === "friend_accepted") setBody(`${name} accepted your friend request.`);
          if (n.type === "friend_request") setBody(`${name} sent you a friend request.`);
        });
    }
  }, [n]);

  return (
    <div className={cn("flex items-start gap-4 px-5 py-4", !n.read && "bg-roome-glow/10")}>
      <Icon className="w-6 h-6 text-roome-core flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", !n.read && "font-semibold")}>{n.title}</p>
        <p className="text-sm text-gray-500 line-clamp-2">{body}</p>
        <p className="text-xs text-gray-400 mt-0.5">{time}</p>
      </div>
      {!n.read && <span className="w-2 h-2 rounded-full bg-roome-glow flex-shrink-0 mt-2" />}
    </div>
  );
}
