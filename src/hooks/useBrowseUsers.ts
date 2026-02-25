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
    if (!uid || !city) { setLoading(false); return; }

    async function load() {
      const [data, blocked] = await Promise.all([
        fetchUsersInCity(city, uid),
        listBlockedUsers(uid),
      ]);
      const blockedSet = new Set(blocked);
      setUsers((data as RoommateUser[]).filter((u) => !blockedSet.has(u.id)));
      setLoading(false);
    }
    void load();
  }, [uid, roommateUser?.city]);

  return { users, setUsers, loading };
}
