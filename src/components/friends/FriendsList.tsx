"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { useFriends } from "@/hooks/useFriends";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { useAuthStore } from "@/store/authStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  searchUsersByUsername,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
} from "@/lib/firebase/firestore";
import { supabase } from "@/lib/supabase/client";
import { FriendRequestCard } from "./FriendRequestCard";
import { InviteModal } from "./InviteModal";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Search, UserPlus } from "lucide-react";

interface UserResult {
  id: string;
  username: string;
  name: string;
  profileImageURL?: string;
}

export function FriendsList() {
  const { uid } = useAuthStore();
  const { user } = useCurrentUser();
  const { friends, loading } = useFriends();
  const { requests } = useFriendRequests();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const [inviteCode, setInviteCode] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncNote, setSyncNote] = useState("");

  function handleSearch(val: string) {
    setSearch(val);
    if (val.length < 3) { setResults([]); return; }
    setSearching(true);
    void searchUsersByUsername(val, uid ?? "", (data) => {
      setResults(data as UserResult[]);
      setSearching(false);
    });
  }

  async function handleSendRequest(user: UserResult) {
    if (!uid) return;
    await sendFriendRequest(uid, user.id);
    setSentTo((s) => new Set(s).add(user.id));
    toast.success(`Friend request sent to ${user.name || user.username}!`);
  }

  async function handleAccept(requestId: string, fromUID: string) {
    if (!uid) return;
    await acceptFriendRequest(requestId, uid, fromUID);
    toast.success("Friend request accepted!");
  }

  async function handleDecline(requestId: string) {
    await declineFriendRequest(requestId);
  }

  async function handleSyncContacts() {
    setSyncNote("");
    if (typeof (navigator as any).contacts === "undefined") {
      toast.error("Contact sync requires Chrome on Android.");
      return;
    }
    setSyncing(true);
    try {
      const selected = await (navigator as any).contacts.select(["name", "tel", "email"], { multiple: true });
      const phones: string[] = selected.flatMap((c: any) => c.tel ?? []);
      const emails: string[] = selected.flatMap((c: any) => c.email ?? []);
      if (phones.length === 0 && emails.length === 0) return;
      const conditions = [
        ...(phones.length ? [`phone.in.(${phones.map((p) => `"${p}"`).join(",")})`] : []),
        ...(emails.length ? [`email.in.(${emails.map((e) => `"${e}"`).join(",")})`] : []),
      ].join(",");
      const { data } = await supabase.from("profiles").select("id, username, name, profileImageURL, occupation").or(conditions).neq("id", uid ?? "");
      if (data && data.length > 0) {
        setResults(data.map((u: any) => ({ id: u.id, username: u.username, name: u.name, profileImageURL: u.profileImageURL })));
      } else {
        setSyncNote("No ROOMe users found in your contacts.");
      }
    } finally {
      setSyncing(false);
    }
  }

  function handleInvite() {
    if (!uid) {
      toast.error("Please sign in to invite friends.");
      return;
    }
    // Use existing code instantly if available
    if (user?.inviteCode) {
      setInviteCode(user.inviteCode);
      setInviteOpen(true);
      return;
    }
    // Generate a new code and show the modal immediately
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const code = Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
    setInviteCode(code);
    setInviteOpen(true);
    // Save in the background so the code can be validated at signup
    void supabase
      .from("profiles")
      .update({ inviteCode: code })
      .eq("id", uid);
  }

  return (
    <div className="space-y-6">
      {/* Search + Sync Contacts + Invite + friend count */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by username…"
            className="w-full pl-9 pr-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-roome-core/40 text-sm"
          />
        </div>
        <Button
          size="sm"
          onClick={handleSyncContacts}
          disabled={syncing}
          className="bg-roome-deep hover:bg-[#083d80] text-white"
        >
          {syncing ? "Syncing…" : "Sync Contacts"}
        </Button>
        <Button
          size="sm"
          onClick={handleInvite}
          className="inline-flex items-center gap-2 bg-[#38b6ff] hover:bg-[#2ea6f0] text-white"
        >
          <UserPlus className="w-4 h-4" />
          Invite
        </Button>
      </div>
      {syncNote && <p className="text-sm text-gray-400">{syncNote}</p>}

      {/* Search results */}
      {searching && <div className="flex justify-center"><LoadingSpinner /></div>}
      {search.length >= 3 && !searching && results.length === 0 && (
        <p className="text-center text-gray-400 text-sm">No users found</p>
      )}
      {results.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
          {results.map((u) => (
            <div key={u.id} className="flex items-center gap-3 p-4">
              <Avatar src={u.profileImageURL} name={u.name || u.username} size={44} />
              <div className="flex-1">
                <p className="font-semibold">{u.name || u.username}</p>
                <p className="text-sm text-gray-400">@{u.username}</p>
              </div>
              <Button
                size="sm"
                variant={sentTo.has(u.id) ? "secondary" : "primary"}
                disabled={sentTo.has(u.id)}
                onClick={() => handleSendRequest(u)}
              >
                {sentTo.has(u.id) ? "Sent ✓" : "Add"}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Pending requests */}
      {search.length < 3 && (
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-roome-core/10 text-roome-core text-sm font-semibold">
            Friend Requests
            <span className="min-w-[18px] h-[18px] bg-roome-core text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {requests.length}
            </span>
          </div>
          {requests.length > 0 ? (
            requests.map((r) => (
              <FriendRequestCard
                key={r.id}
                request={r}
                onAccept={() => handleAccept(r.id, r.fromUID)}
                onDecline={() => handleDecline(r.id)}
              />
            ))
          ) : (
            <p className="text-gray-400 text-sm">No friend requests yet.</p>
          )}
        </div>
      )}

      {/* Friends list */}
      {search.length < 3 && (
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-roome-core/10 text-roome-core text-sm font-semibold">
            My Friends
            <span className="min-w-[18px] h-[18px] bg-roome-core text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {friends.length}
            </span>
          </div>
          {loading ? (
            <div className="flex justify-center py-4"><LoadingSpinner /></div>
          ) : friends.length === 0 ? (
            <div className="bg-white rounded-2xl p-4 text-sm text-gray-600 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <UserPlus className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-800">No friends yet</p>
                  <p className="text-sm text-gray-500">Invite someone to get started.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
              {friends.map((f) => (
                <div key={f.id} className="flex items-center gap-3 p-4">
                  <Avatar src={f.profileImageURL} name={f.name} size={52} />
                  <div>
                    <p className="font-semibold text-black">{f.name || f.username}</p>
                    <p className="text-sm text-black">{f.occupation || f.username}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <InviteModal open={inviteOpen} code={inviteCode} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
