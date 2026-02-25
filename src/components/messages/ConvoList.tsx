"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConversations } from "@/hooks/useConversations";
import { useAuthStore } from "@/store/authStore";
import { ConvoRow } from "./ConvoRow";
import { NewConvoModal } from "./NewConvoModal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import { Plus, Search, MessageSquare } from "lucide-react";
import { markConversationRead } from "@/lib/firebase/firestore";

export function ConvoList() {
  const { convos, loading } = useConversations();
  const { uid } = useAuthStore();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [newConvoOpen, setNewConvoOpen] = useState(false);

  const filtered = convos.filter((c) =>
    !search || (c.otherUserName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleOpen(convoId: string) {
    if (uid) await markConversationRead(convoId, uid);
    router.push(`/messages/${convoId}`);
  }

  if (loading) return <div className="flex justify-center pt-10"><LoadingSpinner /></div>;

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations"
          className="w-full pl-9 pr-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-roome-core/40 text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-4 text-sm text-gray-600 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-semibold text-gray-800">No conversations yet</p>
              <p className="text-sm text-gray-500">Match with someone to start chatting.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
          {filtered.map((c) => (
            <ConvoRow key={c.id} convo={c} uid={uid ?? ""} onTap={() => handleOpen(c.id)} />
          ))}
        </div>
      )}

      {/* FAB */}
      <div className="fixed bottom-20 right-6 lg:bottom-6">
        <Button
          onClick={() => setNewConvoOpen(true)}
          className="rounded-full shadow-lg px-5 py-3 flex items-center gap-2 bg-[#38b6ff] hover:bg-[#2ea6f0] text-white"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      <NewConvoModal open={newConvoOpen} onClose={() => setNewConvoOpen(false)} />
    </div>
  );
}
