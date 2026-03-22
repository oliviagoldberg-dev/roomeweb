"use client";
import { useEffect, useState } from "react";
import { listBlockedUsers } from "@/lib/firebase/firestore";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { RoommateUser } from "@/types/user";

export function useBrowseUsers() {
  const { uid } = useAuthStore();
  const [users, setUsers] = useState<RoommateUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uidSafe = uid ?? "";
    if (!uidSafe) { setLoading(false); return; }

    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      const [res, blocked] = await Promise.all([
        fetch("/api/browse-fof", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }),
        listBlockedUsers(uidSafe),
      ]);

      if (!res.ok) { setLoading(false); return; }

      const { users: profiles } = await res.json();
      const blockedSet = new Set(blocked);
      const filtered = (profiles as RoommateUser[]).filter((u) => !blockedSet.has(u.id));
      filtered.sort((a, b) => (b.boostActive ? 1 : 0) - (a.boostActive ? 1 : 0));
      setUsers(filtered);
      setLoading(false);
    }

    void load();
  }, [uid]);

  return { users, setUsers, loading };
}
