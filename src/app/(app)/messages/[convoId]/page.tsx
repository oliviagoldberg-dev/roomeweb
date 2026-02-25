"use client";
import { useParams } from "next/navigation";
import { ChatWindow } from "@/components/messages/ChatWindow";

export default function ChatPage() {
  const { convoId } = useParams<{ convoId: string }>();
  return <ChatWindow convoId={convoId} />;
}
