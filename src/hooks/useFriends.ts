"use client";
import { useEffect, useState } from "react";
import { listenToFriendships, getUser } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { FriendUser } from "@/types/friends";

export function useFriends() {
  const uid = useAuthStore((s) => s.uid);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }

    const unsub = listenToFriendships(uid, async (rows) => {
      const friendUids = rows.map((d: any) => {
        const users: string[] = d.users ?? [];
        return users.find((u) => u !== uid) ?? "";
      }).filter(Boolean);

      const resolved = await Promise.all(
        friendUids.map(async (fuid) => {
          const d = await getUser(fuid);
          return {
            id: fuid,
            name: d?.name ?? "",
            username: d?.username ?? "",
            occupation: d?.occupation ?? "",
            profileImageURL: d?.profileImageURL,
          } as FriendUser;
        })
      );
      setFriends(resolved);
      setLoading(false);
    });

    return unsub;
  }, [uid]);

  return { friends, loading };
}
