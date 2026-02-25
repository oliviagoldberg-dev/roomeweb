"use client";
import { useEffect, useState } from "react";
import { listenToConversations, getUser } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { Conversation } from "@/types/messages";

export function useConversations() {
  const uid = useAuthStore((s) => s.uid);
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }

    const unsub = listenToConversations(uid, async (rows) => {
      const raw = rows as Conversation[];

      const resolved = await Promise.all(
        raw.map(async (c) => {
          const otherUid = c.participants.find((p) => p !== uid);
          if (!otherUid) return c;
          const userData = await getUser(otherUid);
          return {
            ...c,
            otherUserUid: otherUid,
            otherUserName: userData?.name ?? "Unknown",
            otherUserPhoto: userData?.profileImageURL ?? "",
          };
        })
      );
      setConvos(resolved);
      setLoading(false);
    });

    return unsub;
  }, [uid]);

  return { convos, loading };
}
