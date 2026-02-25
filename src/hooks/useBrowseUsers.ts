"use client";
import { useEffect, useState } from "react";
import { fetchUsersInCity } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { RoommateUser } from "@/types/user";

export function useBrowseUsers() {
  const { uid, roommateUser } = useAuthStore();
  const [users, setUsers] = useState<RoommateUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid || !roommateUser?.city) { setLoading(false); return; }

    fetchUsersInCity(roommateUser.city, uid).then((data) => {
      setUsers(data as RoommateUser[]);
      setLoading(false);
    });
  }, [uid, roommateUser?.city]);

  return { users, setUsers, loading };
}
