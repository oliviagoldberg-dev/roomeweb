"use client";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { RoommateUser } from "@/types/user";
import { PawPrint } from "lucide-react";

interface RoommateCardProps {
  user: RoommateUser;
  onClick: () => void;
}

export function RoommateCard({ user, onClick }: RoommateCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4 text-left w-full"
    >
      <div className="flex items-center gap-3 mb-3">
        <Avatar src={user.profileImageURL} name={user.name} size={52} />
        <div>
          <p className="font-bold text-gray-900">{user.name}{user.age ? `, ${user.age}` : ""}</p>
          <p className="text-sm text-gray-500 line-clamp-1">{user.occupation}</p>
        </div>
      </div>
      {user.bio && <p className="text-sm text-gray-600 line-clamp-2 mb-3">{user.bio}</p>}
      <div className="flex flex-wrap gap-1.5">
        {user.city && <Badge color="blue">{user.city}</Badge>}
        {user.hasPet && (
          <Badge color="teal" className="inline-flex items-center gap-1">
            <PawPrint className="w-3.5 h-3.5" />
            Has a pet
          </Badge>
        )}
      </div>
    </button>
  );
}
