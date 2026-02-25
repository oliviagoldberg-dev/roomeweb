"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useMessages } from "@/hooks/useMessages";
import { useConversations } from "@/hooks/useConversations";
import { sendMessage, markConversationRead } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import * as Dialog from "@radix-ui/react-dialog";
import { Hand } from "lucide-react";

interface ChatWindowProps {
  convoId: string;
}

export function ChatWindow({ convoId }: ChatWindowProps) {
  const router = useRouter();
  const { uid, roommateUser } = useAuthStore();
  const { messages, loading } = useMessages(convoId);
  const { convos } = useConversations();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [linkSheetOpen, setLinkSheetOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [sendingLink, setSendingLink] = useState(false);

  const convo = convos.find((c) => c.id === convoId);
  const otherName = convo?.otherUserName ?? roommateUser?.name ?? "Chat";
  const otherPhoto = convo?.otherUserPhoto ?? roommateUser?.profileImageURL ?? "";
  const otherUid = convo?.otherUserUid ?? uid ?? "";

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Mark read on open
  useEffect(() => {
    if (uid && convoId) markConversationRead(convoId, uid);
  }, [convoId, uid]);

  async function handleSend(text: string) {
    if (!uid || !otherUid) return;
    try {
      await sendMessage(convoId, uid, otherUid, text);
    } catch {
      toast.error("Failed to send message");
    }
  }

  async function handleSendLink() {
    if (!linkUrl.trim() || !uid || !otherUid) return;
    setSendingLink(true);
    try {
      const res = await fetch("/api/link-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: linkUrl }),
      });
      const preview = await res.json();
      await sendMessage(convoId, uid, otherUid, linkUrl, true, {
        title: preview.title ?? linkUrl,
        imageUrl: preview.imageUrl ?? "",
        description: preview.description ?? "",
        source: preview.source ?? new URL(linkUrl).hostname,
      });
      setLinkUrl("");
      setLinkSheetOpen(false);
    } catch {
      toast.error("Failed to send link");
    } finally {
      setSendingLink(false);
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
        <Button variant="ghost" size="sm" onClick={() => router.push("/messages")} className="px-2">←</Button>
        <div className="relative">
          <Avatar src={otherPhoto} name={otherName} size={40} />
          {(convo?.unreadCount?.[uid ?? ""] ?? 0) > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-roome-core text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {convo?.unreadCount?.[uid ?? ""] ?? 0}
            </span>
          )}
        </div>
        <h2 className="font-bold text-gray-900">{otherName}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {loading ? (
          <div className="flex justify-center pt-10"><LoadingSpinner /></div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            <Hand className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Say hello to {otherName}!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} isMe={msg.senderUID === uid} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput
        recipientName={otherName}
        onSend={handleSend}
        onSendLink={() => setLinkSheetOpen(true)}
      />

      {/* Link Sheet */}
      <Dialog.Root open={linkSheetOpen} onOpenChange={(o) => { if (!o) setLinkSheetOpen(false); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Dialog.Content className="fixed inset-x-4 bottom-4 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-8 sm:w-full sm:max-w-md bg-white rounded-3xl shadow-2xl z-50 p-6 space-y-4">
            <Dialog.Title className="font-bold text-lg">Share an Apartment Link</Dialog.Title>
            <p className="text-sm text-gray-500">Share a listing with {otherName}.</p>
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://zillow.com/…"
              className="w-full bg-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-roome-core/40"
              type="url"
            />
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setLinkSheetOpen(false)} className="flex-1">Cancel</Button>
              <Button
                onClick={handleSendLink}
                loading={sendingLink}
                disabled={!linkUrl.trim()}
                className="flex-1"
              >
                Send
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
