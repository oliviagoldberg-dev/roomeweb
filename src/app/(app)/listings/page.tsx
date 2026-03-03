"use client";

import { useUiStore } from "@/store/uiStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSavedListings } from "@/hooks/useSavedListings";
import { useListingFolders } from "@/hooks/useListingFolders";
import { SavedListingCard } from "@/components/listings/SavedListingCard";
import { AddListingModal } from "@/components/listings/AddListingModal";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Home, FolderPlus, Share2, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { sendMessage, shareListingFolder } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { useConversations } from "@/hooks/useConversations";
import { Avatar } from "@/components/ui/Avatar";

export default function ListingsPage() {
  const { user } = useCurrentUser();
  const { listings, loading, addListing, removeListing } = useSavedListings();
  const { folders, addFolder, removeFolder } = useListingFolders();
  const { uid } = useAuthStore();
  const { convos } = useConversations();
  const { addListingModalOpen, setAddListingModalOpen } = useUiStore();
  const [activeFolderId, setActiveFolderId] = useState<string | "all">("all");
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [shareFolderId, setShareFolderId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [sharing, setSharing] = useState(false);

  const visibleListings = activeFolderId === "all"
    ? listings
    : listings.filter((l) => l.folderId === activeFolderId);
  const favoritesFolderId =
    folders.find((f) => f.ownerUid === uid && f.name.toLowerCase() === "favorites")?.id ?? null;

  async function handleCreateFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    try {
      await addFolder(name);
      setNewFolderName("");
      setNewFolderOpen(false);
    } catch {
      toast.error("Could not create folder");
    }
  }

  async function shareFolderToConvo(convoId: string, otherUid: string, otherName: string) {
    if (!uid || !shareFolderId) return;
    setSharing(true);
    try {
      await shareListingFolder(shareFolderId, uid, otherUid);
      const folderName = folders.find((f) => f.id === shareFolderId)?.name ?? "Shared folder";
      await sendMessage(convoId, uid, otherUid, `Shared folder: ${folderName}`);
      toast.success(`Shared folder with ${otherName}!`);
      setShareOpen(false);
    } catch {
      toast.error("Failed to share folder");
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="w-full px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Saved Listings</h1>
          <p className="text-sm text-gray-500">
            Save and share apartments with your matches
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="inline-flex items-center gap-2"
            onClick={() => setNewFolderOpen(true)}
          >
            <FolderPlus className="w-4 h-4" />
            New Folder
          </Button>
          <Button onClick={() => setAddListingModalOpen(true)} size="sm" className="bg-[#38b6ff] hover:bg-[#2ea6f0] text-white">
            + Add Listing
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveFolderId("all")}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium ${
              activeFolderId === "all" ? "bg-roome-core text-white" : "bg-roome-core/10 text-roome-core"
            }`}
          >
            All
          </button>
          {folders.map((f) => (
            <div key={f.id} className="flex items-center gap-2">
              <button
                onClick={() => setActiveFolderId(f.id)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium ${
                  activeFolderId === f.id ? "bg-roome-core text-white" : "bg-roome-core/10 text-roome-core"
                }`}
              >
                {f.name}
              </button>
            </div>
          ))}
        </div>
        {activeFolderId !== "all" && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="inline-flex items-center gap-2"
              onClick={() => { setShareFolderId(null); setShareOpen(true); }}
            >
              <Share2 className="w-4 h-4" />
              Share Folder
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="inline-flex items-center gap-2"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
              Delete Folder
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center pt-16">
          <LoadingSpinner />
        </div>
      ) : visibleListings.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Home className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-semibold">No saved listings yet</p>
          <p className="text-sm mt-1">
            Paste a Zillow or Apartments.com URL to get started
          </p>
          <Button className="mt-4 bg-[#38b6ff] hover:bg-[#2ea6f0] text-white" onClick={() => setAddListingModalOpen(true)}>
            + Add Your First Listing
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleListings.map((l) => (
            <SavedListingCard key={l.id} listing={l} folders={folders} onDeleted={removeListing} />
          ))}
        </div>
      )}

      <AddListingModal
        open={addListingModalOpen}
        onClose={() => setAddListingModalOpen(false)}
        defaultFolderId={favoritesFolderId}
        onSaved={addListing}
      />

      {newFolderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
            <h3 className="font-bold text-lg mb-4">Create Folder</h3>
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g. Favorites"
              className="w-full px-4 py-3 rounded-2xl bg-roome-offwhite text-roome-black placeholder-gray-400 border border-transparent focus:outline-none focus:ring-2 focus:ring-roome-core/40"
            />
            <div className="flex gap-2 mt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setNewFolderOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleCreateFolder}>Create</Button>
            </div>
          </div>
        </div>
      )}

      {shareOpen && shareFolderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
            <h3 className="font-bold text-lg mb-4">Share Folder</h3>
            {convos.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No conversations yet.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {convos.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => shareFolderToConvo(c.id, c.otherUserUid ?? "", c.otherUserName ?? "")}
                    disabled={sharing}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <Avatar src={c.otherUserPhoto} name={c.otherUserName ?? "?"} size={40} />
                    <p className="font-medium">{c.otherUserName}</p>
                  </button>
                ))}
              </div>
            )}
            <Button variant="secondary" className="w-full mt-4" onClick={() => setShareOpen(false)}>Cancel</Button>
          </div>
        </div>
      )}
      {shareOpen && !shareFolderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
            <h3 className="font-bold text-lg mb-4">Choose a Folder to Share</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {folders.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setShareFolderId(f.id)}
                  className="w-full text-left p-3 rounded-2xl hover:bg-gray-50 transition-colors"
                >
                  {f.name}
                </button>
              ))}
            </div>
            <Button variant="secondary" className="w-full mt-4" onClick={() => setShareOpen(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
            <h3 className="font-bold text-lg mb-4">Choose a Folder to Delete</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {folders.filter((f) => f.ownerUid === uid).map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    if (confirm(`Delete folder "${f.name}"? Listings will be left unfiled.`)) {
                      void removeFolder(f.id);
                      setDeleteOpen(false);
                    }
                  }}
                  className="w-full text-left p-3 rounded-2xl hover:bg-gray-50 transition-colors"
                >
                  {f.name}
                </button>
              ))}
            </div>
            <Button variant="secondary" className="w-full mt-4" onClick={() => setDeleteOpen(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
