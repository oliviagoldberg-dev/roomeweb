"use client";
import { useRef, useState } from "react";
import { Link2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { PaywallModal } from "@/components/ui/PaywallModal";

interface MessageInputProps {
  recipientName: string;
  onSend: (text: string) => void;
  onSendLink: () => void;
  disabled?: boolean;
}

export function MessageInput({ recipientName, onSend, onSendLink, disabled }: MessageInputProps) {
  const [text, setText] = useState("");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const { isPremium } = useSubscription();
  const sentCount = useRef(0);

  function handleSend() {
    const t = text.trim();
    if (!t) return;
    if (!isPremium && sentCount.current >= 10) { setPaywallOpen(true); return; }
    onSend(t);
    sentCount.current += 1;
    setText("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
    <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} feature="messages" />
    <div className="flex items-center gap-2 p-3 bg-white border-t border-gray-100">
      <button
        onClick={onSendLink}
        className="w-9 h-9 rounded-full bg-roome-core/10 flex items-center justify-center text-roome-core hover:bg-roome-core/20 flex-shrink-0"
        title="Share a listing"
      >
        <Link2 className="w-4 h-4" />
      </button>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`Message ${recipientName}…`}
        disabled={disabled}
        className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-roome-core/40"
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        className="w-9 h-9 rounded-full bg-roome-core flex items-center justify-center text-white disabled:opacity-40 hover:bg-roome-deep flex-shrink-0"
      >
        ↑
      </button>
    </div>
    </>
  );
}
