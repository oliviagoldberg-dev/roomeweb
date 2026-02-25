"use client";
import { useEffect, useState } from "react";
import { listenToFriendRequests, getUser } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { FriendRequest } from "@/types/friends";

export function useFriendRequests() {
  const uid = useAuthStore((s) => s.uid);
  const [requests, setRequests] = useState<FriendRequest[]>([]);

  useEffect(() => {
    if (!uid) return;

    const unsub = listenToFriendRequests(uid, async (rows) => {
      const resolved = await Promise.all(
        rows.map(async (data: any) => {
          const userData = await getUser(data.fromUID);
          return {
            id: data.id,
            fromUID: data.fromUID,
            toUID: data.toUID,
            name: userData?.name ?? "",
            username: userData?.username ?? "",
            profileImageURL: userData?.profileImageURL,
            status: data.status,
          } as FriendRequest;
        })
      );
      setRequests(resolved);
    });

    return unsub;
  }, [uid]);

  return { requests };
}
