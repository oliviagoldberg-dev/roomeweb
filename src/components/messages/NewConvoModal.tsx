"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { searchUsersByUsername, ensureConversation } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { Avatar } from "@/components/ui/Avatar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { MessageSquare } from "lucide-react";

interface NewConvoModalProps {
  open: boolean;
  onClose: () => void;
}

interface UserResult {
  id: string;
  username: string;
  name: string;
  profileImageURL?: string;
}

export function NewConvoModal({ open, onClose }: NewConvoModalProps) {
  const router = useRouter();
  const { uid } = useAuthStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);

  function handleSearch(val: string) {
    setQuery(val);
    if (val.length < 3) { setResults([]); return; }
    setLoading(true);
    searchUsersByUsername(val, uid ?? "", (data) => {
      setResults(data as UserResult[]);
      setLoading(false);
    });
  }

  async function startConvo(user: UserResult) {
    if (!uid) return;
    const convoId = await ensureConversation(uid, user.id);
    onClose();
    router.push(`/messages/${convoId}`);
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed inset-x-4 top-20 max-h-[70vh] sm:inset-auto sm:left-1/2 sm:top-24 sm:-translate-x-1/2 sm:w-full sm:max-w-md bg-white rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col">
          <div className="p-5 border-b flex items-center justify-between">
            <Dialog.Title className="font-bold text-lg">New Conversation</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-700">✕</button>
            </Dialog.Close>
          </div>

          <div className="p-4">
            <input
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by username…"
              autoFocus
              className="w-full bg-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-roome-core/40"
            />
          </div>

          <div className="overflow-y-auto flex-1 px-4 pb-4">
            {loading && <div className="flex justify-center py-6"><LoadingSpinner /></div>}
            {!loading && query.length >= 3 && results.length === 0 && (
              <p className="text-center text-gray-400 py-6 text-sm">No users found</p>
            )}
            {results.map((u) => (
              <button
                key={u.id}
                onClick={() => startConvo(u)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors text-left"
              >
                <Avatar src={u.profileImageURL} name={u.name || u.username} size={44} />
                <div>
                  <p className="font-semibold">{u.name || u.username}</p>
                  <p className="text-sm text-gray-400">@{u.username}</p>
                </div>
                <MessageSquare className="ml-auto w-4 h-4 text-roome-core" />
              </button>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
