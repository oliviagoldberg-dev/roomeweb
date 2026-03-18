"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getUser, likeUser, ensureConversation } from "@/lib/firebase/firestore";
import { supabase } from "@/lib/supabase/client";
import { RoommateUser } from "@/types/user";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Heart, X, PawPrint } from "lucide-react";
import toast from "react-hot-toast";

export default function LikesPage() {
  const { uid } = useAuthStore();
  const router = useRouter();
  const [likers, setLikers] = useState<RoommateUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioned, setActioned] = useState<Set<string>>(new Set());
  const [messaging, setMessaging] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }

    async function load() {
      // Fetch fresh profile to get latest likedBy + connections
      const { data: me } = await supabase
        .from("profiles")
        .select("likedBy, connections")
        .eq("id", uid)
        .single();

      const likedBy: string[] = me?.likedBy ?? [];
      const connections: string[] = me?.connections ?? [];
      const connectionSet = new Set(connections);

      // Only show people who liked me but we haven't matched yet
      const pending = likedBy.filter((id) => !connectionSet.has(id));
      if (pending.length === 0) { setLoading(false); return; }

      const users = await Promise.all(pending.map((id) => getUser(id)));
      setLikers(users.filter(Boolean) as RoommateUser[]);
      setLoading(false);
    }

    void load();
  }, [uid]);

  async function handleLikeBack(user: RoommateUser) {
    if (!uid) return;
    setMessaging(user.id);
    try {
      const result = await likeUser(uid, user.id);
      setActioned((prev) => new Set(prev).add(user.id));
      if (result.isMatch) {
        toast.success(`It's a match with ${user.name}! Opening chat…`);
        const convoId = await ensureConversation(uid, user.id);
        router.push(`/messages/${convoId}`);
      } else {
        toast.success(`You liked ${user.name} back!`);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setMessaging(null);
    }
  }

  const visible = likers.filter((u) => !actioned.has(u.id));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-black mb-6">
        Likes
        {visible.length > 0 && (
          <span className="ml-2 text-sm font-bold text-white bg-[#38b6ff] rounded-full px-2 py-0.5">{visible.length}</span>
        )}
      </h1>

      {loading ? (
        <div className="flex justify-center pt-20"><LoadingSpinner /></div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Heart className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="font-semibold">No likes yet</p>
          <p className="text-sm mt-1">When someone likes your profile, they&apos;ll show up here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((user) => (
            <div key={user.id} className="bg-white rounded-2xl shadow-sm p-4 flex gap-4 items-start border border-gray-100">
              <Avatar src={user.profileImageURL} name={user.name} size={64} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-lg leading-tight">
                  {user.name}{user.age ? `, ${user.age}` : ""}
                </p>
                {user.occupation && <p className="text-sm text-gray-500 mt-0.5">{user.occupation}</p>}
                {user.bio && <p className="text-sm text-gray-600 mt-1.5 line-clamp-3">{user.bio}</p>}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {user.city && <Badge color="blue">{user.city}</Badge>}
                  {user.hasPet && (
                    <Badge color="teal" className="inline-flex items-center gap-1">
                      <PawPrint className="w-3 h-3" />Has a pet
                    </Badge>
                  )}
                  {user.budgetMin && user.budgetMax && (
                    <Badge color="gray">${user.budgetMin.toLocaleString()}–${user.budgetMax.toLocaleString()}/mo</Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => handleLikeBack(user)}
                  disabled={messaging === user.id}
                  className="w-12 h-12 rounded-full bg-[#38b6ff] flex items-center justify-center text-white shadow hover:bg-[#2ea6f0] disabled:opacity-60 transition-colors"
                  aria-label="Like back"
                >
                  <Heart className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActioned((prev) => new Set(prev).add(user.id))}
                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shadow hover:bg-gray-200 transition-colors"
                  aria-label="Pass"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
