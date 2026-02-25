"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getUser } from "@/lib/firebase/firestore";
import { RoommateUser } from "@/types/user";

export function useCurrentUser() {
  const uid = useAuthStore((s) => s.uid);
  const roommateUser = useAuthStore((s) => s.roommateUser);
  const setRoommateUser = useAuthStore((s) => s.setRoommateUser);
  const [loading, setLoading] = useState(!roommateUser);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    if (roommateUser) { setLoading(false); return; }
    getUser(uid).then((data) => {
      setRoommateUser(data as RoommateUser);
      setLoading(false);
    });
  }, [uid, roommateUser, setRoommateUser]);

  return { user: roommateUser, loading };
}
