import { Message } from "@/types/messages";
import { ListingMessageCard } from "./ListingMessageCard";
import { formatMessageTime } from "@/lib/utils/formatTime";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
}

export function MessageBubble({ message, isMe }: MessageBubbleProps) {
  const time = message.createdAt ? formatMessageTime(new Date(message.createdAt)) : "";

  return (
    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
      {message.isLink && message.listing ? (
        <ListingMessageCard listing={message.listing} url={message.text} isMe={isMe} />
      ) : (
        <div
          className={`px-4 py-2.5 rounded-2xl max-w-xs text-sm leading-relaxed ${
            isMe
              ? "bg-roome-core text-white rounded-br-none"
              : "bg-roome-pale text-roome-black rounded-bl-none"
          }`}
        >
          {message.text}
        </div>
      )}
      <span className="text-[10px] text-gray-400 mt-0.5 px-1">{time}</span>
    </div>
  );
}
