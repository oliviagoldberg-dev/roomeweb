"use client";
import { Conversation } from "@/types/messages";
import { Avatar } from "@/components/ui/Avatar";
import { formatMessageTime } from "@/lib/utils/formatTime";

interface ConvoRowProps {
  convo: Conversation;
  uid: string;
  onTap: () => void;
}

export function ConvoRow({ convo, uid, onTap }: ConvoRowProps) {
  const unreadCount = convo.unreadCount?.[uid] ?? 0;
  const hasUnread = unreadCount > 0;
  const time = convo.lastMessageTime
    ? formatMessageTime(new Date(convo.lastMessageTime))
    : "";

  return (
    <button onClick={onTap} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
      <div className="relative flex-shrink-0">
        <Avatar src={convo.otherUserPhoto} name={convo.otherUserName ?? "?"} size={50} />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-roome-core text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={`font-${hasUnread ? "bold" : "medium"} text-gray-900 truncate`}>
            {convo.otherUserName ?? "Unknown"}
          </p>
          <span className={`text-xs flex-shrink-0 ml-2 ${hasUnread ? "text-roome-core" : "text-gray-400"}`}>
            {time}
          </span>
        </div>
        <p className={`text-sm truncate ${hasUnread ? "text-gray-700 font-medium" : "text-gray-400"}`}>
          {convo.lastMessage || "Say hello!"}
        </p>
      </div>
      {hasUnread && <span className="w-2 h-2 rounded-full bg-roome-core flex-shrink-0" />}
    </button>
  );
}
