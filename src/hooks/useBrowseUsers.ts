"use client";
import { useEffect, useState } from "react";
import { listBlockedUsers } from "@/lib/firebase/firestore";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { RoommateUser } from "@/types/user";

export function useBrowseUsers() {
  const { uid, roommateUser } = useAuthStore();
  const [users, setUsers] = useState<RoommateUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uidSafe = uid ?? "";
    if (!uidSafe) { setLoading(false); return; }

    async function load() {
      // Get my direct friends
      const { data: myFriendships } = await supabase
        .from("friendships")
        .select("users")
        .contains("users", [uidSafe]);

      const myFriendIds = new Set<string>(
        (myFriendships ?? []).flatMap((r: any) => r.users).filter((u: string) => u !== uidSafe)
      );

      if (myFriendIds.size === 0) { setLoading(false); return; }

      // Get friends-of-friends
      const { data: fofFriendships } = await supabase
        .from("friendships")
        .select("users")
        .overlaps("users", Array.from(myFriendIds));

      const fofIds = new Set<string>();
      for (const row of fofFriendships ?? []) {
        for (const u of (row as any).users) {
          if (u !== uidSafe && !myFriendIds.has(u)) fofIds.add(u);
        }
      }

      if (fofIds.size === 0) { setLoading(false); return; }

      const [{ data: profiles }, blocked] = await Promise.all([
        supabase.from("profiles").select("*").in("id", Array.from(fofIds)).eq("onboardingComplete", true),
        listBlockedUsers(uidSafe),
      ]);

      const blockedSet = new Set(blocked);
      const filtered = (profiles as RoommateUser[] ?? []).filter((u) => !blockedSet.has(u.id));
      filtered.sort((a, b) => (b.boostActive ? 1 : 0) - (a.boostActive ? 1 : 0));
      setUsers(filtered);
      setLoading(false);
    }

    void load();
  }, [uid, roommateUser?.moveCity, roommateUser?.city]);

  return { users, setUsers, loading };
}
