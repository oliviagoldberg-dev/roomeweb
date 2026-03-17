"use client";
import { useState } from "react";
import { SwipeCard } from "./SwipeCard";
import { RoommateUser } from "@/types/user";
import { Search } from "lucide-react";

interface SwipeDeckProps {
  users: RoommateUser[];
  onCardClick: (user: RoommateUser) => void;
}

export function SwipeDeck({ users, onCardClick }: SwipeDeckProps) {
  const [index, setIndex] = useState(0);

  const remaining = users.slice(index);

  if (remaining.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
        <Search className="w-10 h-10 mb-3 text-gray-300" />
        <p className="font-semibold">You've seen everyone!</p>
        <p className="text-sm">Check back later for new roommates.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height: 500 }}>
      {remaining.slice(0, 3).map((user, i) => (
        <SwipeCard
          key={user.id}
          user={user}
          index={i}
          onClick={() => onCardClick(user)}
          onSwipeLeft={() => setIndex((prev) => prev + 1)}
          onSwipeRight={() => setIndex((prev) => prev + 1)}
        />
      ))}
    </div>
  );
}
