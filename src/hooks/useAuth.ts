"use client";
import { useEffect } from "react";
import { onAuthChanged } from "@/lib/firebase/auth";
import { getUser, ensureProfile } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { RoommateUser } from "@/types/user";

export function useAuth() {
  const { setFirebaseUser, setRoommateUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsub = onAuthChanged(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          let data = await getUser(fbUser.id);
          if (!data) {
            data = await ensureProfile(fbUser.id, (fbUser as any).email, (fbUser as any).user_metadata?.name);
          }
          setRoommateUser(data as RoommateUser | null);
        } catch {
          setRoommateUser(null);
        }
      } else {
        setRoommateUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [setFirebaseUser, setRoommateUser, setLoading]);
}
