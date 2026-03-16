"use client";
import { useEffect, useState } from "react";
import { fetchFriendsInCity } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { RoommateUser } from "@/types/user";

export function useFriendsInCity() {
  const { uid, roommateUser } = useAuthStore();
  const [friends, setFriends] = useState<RoommateUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const city = roommateUser?.moveCity || roommateUser?.city;
    if (!uid || !city) { setLoading(false); return; }

    fetchFriendsInCity(uid, city)
      .then(setFriends)
      .finally(() => setLoading(false));
  }, [uid, roommateUser?.moveCity, roommateUser?.city]);

  return { friends, loading };
}
