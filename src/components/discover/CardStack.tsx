"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { likeUser } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { useBrowseUsers } from "@/hooks/useBrowseUsers";
import { SwipeCard } from "./SwipeCard";
import { ActionButtons } from "./ActionButtons";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Sparkles } from "lucide-react";

export function CardStack() {
  const { uid } = useAuthStore();
  const { users, loading } = useBrowseUsers();
  const { pushUndo, popUndo, undoStack } = useUiStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const visible = users.slice(currentIndex, currentIndex + 3).reverse();

  async function handleLike() {
    if (!uid || currentIndex >= users.length) return;
    const target = users[currentIndex];
    pushUndo(target);
    setCurrentIndex((i) => i + 1);
    try {
      const isMatch = await likeUser(uid, target.id);
      if (isMatch) toast.success(`It's a match with ${target.name}!`);
    } catch { /* ignore */ }
  }

  function handlePass() {
    if (currentIndex >= users.length) return;
    pushUndo(users[currentIndex]);
    setCurrentIndex((i) => i + 1);
  }

  function handleUndo() {
    const user = popUndo();
    if (!user) return;
    setCurrentIndex((i) => Math.max(0, i - 1));
  }

  if (loading) return <div className="flex justify-center pt-20"><LoadingSpinner /></div>;

  if (currentIndex >= users.length) {
    return (
      <div className="text-center py-20 text-gray-400">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-roome-core" />
        <p className="font-semibold text-xl">You&apos;ve seen everyone!</p>
        <p className="text-sm mt-1">Check back later for new roommates</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative h-[480px]">
        {visible.map((user, i) => (
          <SwipeCard
            key={user.id}
            user={user}
            isTop={i === visible.length - 1}
            onLike={handleLike}
            onPass={handlePass}
          />
        ))}
      </div>
      <ActionButtons
        onLike={handleLike}
        onPass={handlePass}
        onUndo={handleUndo}
        canUndo={undoStack.length > 0}
      />
    </div>
  );
}
