"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import * as Dialog from "@radix-ui/react-dialog";
import { likeUser, ensureConversation, blockUser, reportUser } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { useSubscription } from "@/hooks/useSubscription";
import { RoommateUser } from "@/types/user";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PaywallModal } from "@/components/ui/PaywallModal";
import { useRouter } from "next/navigation";
import { Heart, MessageSquare, PawPrint } from "lucide-react";

interface UserDetailModalProps {
  user: RoommateUser;
  onClose: () => void;
}

export function PhotoSwiper({ photos, name, heightClass = "h-64" }: { photos: string[]; name: string; heightClass?: string }) {
  const [idx, setIdx] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    setTouchStart(e.touches[0].clientX);
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart === null) return;
    const delta = touchStart - e.changedTouches[0].clientX;
    if (delta > 40) setIdx((i) => Math.min(i + 1, photos.length - 1));
    if (delta < -40) setIdx((i) => Math.max(i - 1, 0));
    setTouchStart(null);
  }

  if (!photos.length) {
    return (
      <div className={`${heightClass} bg-gradient-to-br from-roome-core to-roome-glow flex items-center justify-center`}>
        <Avatar src={null} name={name} size={100} />
      </div>
    );
  }

  return (
    <div
      className={`relative ${heightClass} overflow-hidden select-none`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <img
        src={photos[idx]}
        alt={name}
        className="w-full h-full object-cover transition-opacity duration-200"
      />

      {/* Gradient overlay at bottom for dots legibility */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />

      {/* Dot indicators */}
      {photos.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === idx ? "bg-white w-5" : "bg-white/50 w-1.5"
              }`}
            />
          ))}
        </div>
      )}

      {/* Tap left/right to navigate */}
      {idx > 0 && (
        <button
          className="absolute left-0 top-0 bottom-0 w-1/3"
          onClick={() => setIdx((i) => i - 1)}
        />
      )}
      {idx < photos.length - 1 && (
        <button
          className="absolute right-0 top-0 bottom-0 w-1/3"
          onClick={() => setIdx((i) => i + 1)}
        />
      )}
    </div>
  );
}

export function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  const { uid } = useAuthStore();
  const { canConnect } = useSubscription();
  const router = useRouter();
  const [liking, setLiking] = useState(false);
  const [messaging, setMessaging] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const photos = (user.photoURLs?.length ? user.photoURLs : user.profileImageURL ? [user.profileImageURL] : []);

  async function handleLike() {
    if (!uid) return;
    if (!canConnect) { setPaywallOpen(true); return; }
    setLiking(true);
    try {
      const result = await likeUser(uid, user.id);
      if (result.limitReached) {
        setPaywallOpen(true);
      } else if (result.isMatch) {
        toast.success(`It's a match with ${user.name}!`);
        setMatchOpen(true);
      } else {
        toast.success(`You liked ${user.name}!`);
      }
    } catch {
      toast.error("Failed to like user");
    } finally {
      setLiking(false);
    }
  }

  async function handleBlock() {
    if (!uid) return;
    if (!confirm(`Block ${user.name}? You won't see each other.`)) return;
    try {
      await blockUser(uid, user.id);
      toast.success(`${user.name} blocked`);
      onClose();
    } catch {
      toast.error("Failed to block user");
    }
  }

  async function handleReport() {
    if (!uid) return;
    const reason = prompt("Report reason (optional):") ?? "";
    try {
      await reportUser(uid, user.id, reason);
      toast.success("Report submitted");
    } catch {
      toast.error("Failed to submit report");
    }
  }

  async function handleMessage() {
    if (!uid) return;
    setMessaging(true);
    try {
      const convoId = await ensureConversation(uid, user.id);
      onClose();
      router.push(`/messages/${convoId}`);
    } catch {
      toast.error("Failed to open conversation");
    } finally {
      setMessaging(false);
    }
  }

  async function handleStartChat() {
    if (!uid) return;
    setMessaging(true);
    try {
      const convoId = await ensureConversation(uid, user.id);
      setMatchOpen(false);
      onClose();
      router.push(`/messages/${convoId}`);
    } catch {
      toast.error("Failed to open conversation");
    } finally {
      setMessaging(false);
    }
  }

  return (
    <>
    <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} feature="connections" />
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed inset-x-4 top-[5%] bottom-[5%] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg bg-white rounded-3xl z-50 overflow-y-auto shadow-2xl">
          <Dialog.Title className="sr-only">{user.name}</Dialog.Title>
          <div className="relative">
            <PhotoSwiper photos={photos} name={user.name} />
            <Dialog.Close asChild>
              <button className="absolute top-4 right-4 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white">
                ✕
              </button>
            </Dialog.Close>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-2xl font-black">{user.name}{user.age ? `, ${user.age}` : ""}</h2>
              {user.occupation && <p className="text-gray-500">{user.occupation}</p>}
              {user.school && <p className="text-sm text-gray-400">{user.school}</p>}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {user.city && <Badge color="blue">{user.city}</Badge>}
              {user.neighborhood && <Badge color="gray">{user.neighborhood}</Badge>}
              {user.hasPet && (
                <Badge color="teal" className="inline-flex items-center gap-1">
                  <PawPrint className="w-3.5 h-3.5" />
                  Has a pet
                </Badge>
              )}
            </div>

            {user.bio && <p className="text-sm text-gray-700">{user.bio}</p>}

            <div className="grid grid-cols-2 gap-3 text-sm">
              {user.sleepSchedule && <Info label="Sleep" value={user.sleepSchedule} />}
              {user.workFromHome && <Info label="WFH" value={user.workFromHome} />}
              {user.leaseLength && <Info label="Lease" value={user.leaseLength} />}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={handleMessage} loading={messaging} className="flex-1 inline-flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Message
              </Button>
              <Button onClick={handleLike} loading={liking} className="flex-1 inline-flex items-center justify-center gap-2">
                <Heart className="w-4 h-4" />
                Like
              </Button>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs">
              <button onClick={handleReport} className="text-gray-400 hover:text-gray-600">Report</button>
              <button onClick={handleBlock} className="text-gray-400 hover:text-gray-600">Block</button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
    {matchOpen && (
      <MatchPrompt
        name={user.name}
        onStart={handleStartChat}
        onClose={() => setMatchOpen(false)}
        loading={messaging}
      />
    )}
    </>
  );
}

function MatchPrompt({ name, onStart, onClose, loading }: { name: string; onStart: () => void; onClose: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center">
        <h3 className="text-2xl font-black mb-2">It&apos;s a match!</h3>
        <p className="text-sm text-gray-600 mb-6">Start a chat with {name}?</p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Maybe later</Button>
          <Button className="flex-1" onClick={onStart} loading={loading}>Start chat</Button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-roome-offwhite rounded-xl p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-medium text-gray-800">{value}</p>
    </div>
  );
}
