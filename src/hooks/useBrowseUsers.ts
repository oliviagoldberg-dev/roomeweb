"use client";
import { useEffect, useState } from "react";
import { fetchUsersInCity, listBlockedUsers } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { RoommateUser } from "@/types/user";

export function useBrowseUsers() {
  const { uid, roommateUser } = useAuthStore();
  const [users, setUsers] = useState<RoommateUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const city = roommateUser?.city;
    const uidSafe = uid ?? "";
    if (!uidSafe || !city) { setLoading(false); return; }

    async function load(citySafe: string, uidSafe: string) {
      const [data, blocked] = await Promise.all([
        fetchUsersInCity(citySafe, uidSafe),
        listBlockedUsers(uidSafe),
      ]);
      const blockedSet = new Set(blocked);
      setUsers((data as RoommateUser[]).filter((u) => !blockedSet.has(u.id)));
      setLoading(false);
    }
    void load(city, uidSafe);
  }, [uid, roommateUser?.city]);

  return { users, setUsers, loading };
}
