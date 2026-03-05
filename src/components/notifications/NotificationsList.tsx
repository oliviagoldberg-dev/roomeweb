"use client";
import { useEffect, useRef, useState } from "react";
import { listenToNotifications } from "@/lib/firebase/firestore";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { AppNotification } from "@/types/notifications";
import { NotificationRow } from "./NotificationRow";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Bell } from "lucide-react";

export function NotificationsList() {
  const { uid } = useAuthStore();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const deletedIds = useRef(new Set<string>());

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    const unsub = listenToNotifications(uid, (rows) => {
      setNotifications((rows as AppNotification[]).filter((n) => !deletedIds.current.has(n.id)));
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  if (loading) return <div className="flex justify-center pt-10"><LoadingSpinner /></div>;

  if (notifications.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <Bell className="w-10 h-10 mx-auto mb-2 text-gray-300" />
        <p className="font-semibold">No notifications yet</p>
      </div>
    );
  }

  async function handleDelete(id: string) {
    deletedIds.current.add(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("notifications").delete().eq("id", id);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
      {notifications.map((n) => (
        <NotificationRow key={n.id} notification={n} onDelete={handleDelete} />
      ))}
    </div>
  );
}
