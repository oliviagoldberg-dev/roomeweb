"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { Trash2, Share2, Folder } from "lucide-react";
import { deleteSavedListing, sendMessage, ensureConversation, updateListingFolder } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { useConversations } from "@/hooks/useConversations";
import { SavedListing } from "@/types/listings";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useRouter } from "next/navigation";
import { formatSourceLabel } from "@/lib/utils/formatSource";
import type { ListingFolder } from "@/types/folders";

interface SavedListingCardProps {
  listing: SavedListing;
  folders: ListingFolder[];
  onFolderChange?: (id: string, folderId: string | null) => void;
}

export function SavedListingCard({ listing, folders, onFolderChange }: SavedListingCardProps) {
  const router = useRouter();
  const { uid } = useAuthStore();
  const { convos } = useConversations();
  const [shareOpen, setShareOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [moving, setMoving] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteSavedListing(listing.id);
      toast.success("Listing removed");
    } catch {
      toast.error("Failed to remove");
    } finally {
      setDeleting(false);
    }
  }

  async function shareToConvo(otherUid: string, otherName: string) {
    if (!uid) return;
    setSharing(true);
    try {
      const convoId = await ensureConversation(uid, otherUid);
      const coverPhoto = listing.photoURLs?.[0] ?? listing.imageUrl;
      await sendMessage(convoId, uid, otherUid, listing.url, true, {
        title: listing.title,
        imageUrl: coverPhoto,
        description: listing.description,
        source: listing.source,
      });
      toast.success(`Shared with ${otherName}!`);
      setShareOpen(false);
      router.push(`/messages/${convoId}`);
    } catch {
      toast.error("Failed to share");
    } finally {
      setSharing(false);
    }
  }

  async function moveToFolder(folderId: string | null) {
    setMoving(true);
    try {
      await updateListingFolder(listing.id, folderId);
      onFolderChange?.(listing.id, folderId);
      setMoveOpen(false);
    } finally {
      setMoving(false);
    }
  }

  const isExternal = listing.url && listing.source !== "Manual";
  const sourceLabel = formatSourceLabel(listing.source);
  const priceLabel =
    listing.rent != null ? `$${listing.rent.toLocaleString()}/mo` : "Rent not set";
  const priceBgClass = listing.rent != null ? "bg-roome-core/10" : "bg-roome-core/20";

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Price banner */}
      {isExternal ? (
        <a href={listing.url} target="_blank" rel="noopener noreferrer">
          <div className={`w-full h-24 ${priceBgClass} flex items-center justify-center`}>
            <span className="text-roome-black text-lg font-bold">{priceLabel}</span>
          </div>
        </a>
      ) : (
        <div className={`w-full h-24 ${priceBgClass} flex items-center justify-center`}>
          <span className="text-roome-black text-lg font-bold">{priceLabel}</span>
        </div>
      )}

      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <Badge color="blue" className="text-[11px]">{sourceLabel}</Badge>
          {listing.beds && <Badge color="gray" className="text-[11px]">{listing.beds} bd</Badge>}
          {listing.baths && <Badge color="gray" className="text-[11px]">{listing.baths} ba</Badge>}
        </div>

        {isExternal ? (
          <a href={listing.url} target="_blank" rel="noopener noreferrer">
            <p className="font-semibold text-gray-900 hover:text-roome-core transition-colors line-clamp-2">
              {listing.title}
            </p>
          </a>
        ) : (
          <p className="font-semibold text-gray-900 line-clamp-2">{listing.title}</p>
        )}

        {/* Utilities */}
        {listing.utilities != null && (
          <p className="text-sm text-gray-400">
            + ${listing.utilities}/mo utilities
          </p>
        )}

        {/* Description / notes */}
        {(listing.notes || listing.description) && (
          <p className="text-sm text-gray-500 line-clamp-2">{listing.notes || listing.description}</p>
        )}

        {/* Amenities */}
        {listing.amenities && listing.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {listing.amenities.slice(0, 4).map((a) => (
              <span key={a} className="text-[11px] px-2 py-0.5 bg-roome-pale text-roome-deep rounded-full">{a}</span>
            ))}
            {listing.amenities.length > 4 && (
              <span className="text-[11px] px-2 py-0.5 bg-roome-pale text-roome-deep rounded-full">
                +{listing.amenities.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Lease / move-in */}
        {(listing.leaseLength || listing.moveInDate) && (
          <p className="text-xs text-gray-400">
            {listing.leaseLength && <span>{listing.leaseLength}</span>}
            {listing.leaseLength && listing.moveInDate && <span> · </span>}
            {listing.moveInDate && <span>Available {listing.moveInDate}</span>}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 inline-flex items-center justify-center gap-2"
            onClick={() => setShareOpen(true)}
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="inline-flex items-center justify-center gap-2"
            onClick={() => setMoveOpen(true)}
          >
            <Folder className="w-3.5 h-3.5" />
            Move
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
        </div>
      </div>

      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
            <h3 className="font-bold text-lg mb-4">Share to Chat</h3>
            {convos.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No conversations yet.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {convos.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => shareToConvo(c.otherUserUid ?? "", c.otherUserName ?? "")}
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

      {moveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
            <h3 className="font-bold text-lg mb-4">Move to Folder</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              <button
                onClick={() => moveToFolder(null)}
                disabled={moving}
                className="w-full text-left p-3 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                No folder
              </button>
              {folders.map((f) => (
                <button
                  key={f.id}
                  onClick={() => moveToFolder(f.id)}
                  disabled={moving}
                  className={`w-full text-left p-3 rounded-2xl transition-colors ${
                    listing.folderId === f.id ? "bg-roome-core/10" : "hover:bg-gray-50"
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
            <Button variant="secondary" className="w-full mt-4" onClick={() => setMoveOpen(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </>
  );
}
