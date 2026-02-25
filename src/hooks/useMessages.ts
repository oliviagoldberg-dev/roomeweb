"use client";
import { useEffect, useState } from "react";
import { listenToMessages } from "@/lib/firebase/firestore";
import { Message } from "@/types/messages";

export function useMessages(convoId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!convoId) { setLoading(false); return; }

    const unsub = listenToMessages(convoId, (rows) => {
      setMessages(rows as Message[]);
      setLoading(false);
    });

    return unsub;
  }, [convoId]);

  return { messages, loading };
}
