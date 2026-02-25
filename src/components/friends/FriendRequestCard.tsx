import { FriendRequest } from "@/types/friends";
import { Avatar } from "@/components/ui/Avatar";

interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept: () => void;
  onDecline: () => void;
}

export function FriendRequestCard({ request, onAccept, onDecline }: FriendRequestCardProps) {
  const name = request.name || request.username;
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
      <Avatar src={request.profileImageURL} name={name} size={48} />
      <div className="flex-1">
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-gray-400">@{request.username}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onDecline}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
        >
          ✕
        </button>
        <button
          onClick={onAccept}
          className="w-9 h-9 rounded-full bg-roome-core flex items-center justify-center text-white hover:bg-roome-deep transition"
        >
          ✓
        </button>
      </div>
    </div>
  );
}
