"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { Trash2, Share2, Folder, Pencil } from "lucide-react";
import { deleteSavedListing, sendMessage, ensureConversation, updateListingFolder, updateListing } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { useConversations } from "@/hooks/useConversations";
import { SavedListing } from "@/types/listings";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { useRouter } from "next/navigation";
import { formatSourceLabel } from "@/lib/utils/formatSource";
import type { ListingFolder } from "@/types/folders";
import { BEDS_OPTIONS, BATHS_OPTIONS, LEASE_LENGTH_OPTIONS } from "@/lib/utils/constants";

interface SavedListingCardProps {
  listing: SavedListing;
  folders: ListingFolder[];
  onFolderChange?: (id: string, folderId: string | null) => void;
  onDeleted?: (id: string) => void;
}

export function SavedListingCard({ listing, folders, onFolderChange, onDeleted }: SavedListingCardProps) {
  const router = useRouter();
  const { uid } = useAuthStore();
  const { convos } = useConversations();
  const [displayTitle, setDisplayTitle] = useState(listing.title ?? "");
  const [displayRent, setDisplayRent] = useState<number | null>(listing.rent ?? null);
  const [shareOpen, setShareOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [moving, setMoving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editTitle, setEditTitle] = useState(listing.title ?? "");
  const [editRent, setEditRent] = useState(listing.rent?.toString() ?? "");
  const [editUtilities, setEditUtilities] = useState(listing.utilities?.toString() ?? "");
  const [editBeds, setEditBeds] = useState(listing.beds ?? "");
  const [editBaths, setEditBaths] = useState(listing.baths ?? "");
  const [editLease, setEditLease] = useState(listing.leaseLength ?? "");
  const [editMoveIn, setEditMoveIn] = useState(listing.moveInDate ?? "");
  const [editNotes, setEditNotes] = useState(listing.notes ?? "");

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteSavedListing(listing.id);
      onDeleted?.(listing.id);
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

  function parseMoney(value: string) {
    const normalized = value.replace(/[^\d]/g, "");
    if (!normalized) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  async function saveEdits() {
    setSavingEdit(true);
    try {
      const nextTitle = editTitle.trim() || listing.title;
      const nextRent = parseMoney(editRent);
      const nextUtilities = parseMoney(editUtilities);
      await updateListing(listing.id, {
        title: nextTitle,
        rent: nextRent,
        utilities: nextUtilities,
        beds: editBeds || null,
        baths: editBaths || null,
        leaseLength: editLease || null,
        moveInDate: editMoveIn || null,
        notes: editNotes || null,
      });
      setDisplayTitle(nextTitle ?? "");
      setDisplayRent(nextRent);
      setEditUtilities(nextUtilities?.toString() ?? "");
      setEditOpen(false);
    } finally {
      setSavingEdit(false);
    }
  }

  const isExternal = listing.url && listing.source !== "Manual";
  const sourceLabel = formatSourceLabel(listing.source);
  const priceLabel =
    displayRent != null && Number.isFinite(displayRent)
      ? `$${displayRent.toLocaleString()}/mo`
      : "Rent not set";
  const priceBgClass = displayRent != null ? "bg-roome-core/10" : "bg-roome-core/30";

  return (
    <div className="space-y-0">
      <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge color="blue" className="text-[11px]">{priceLabel}</Badge>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-roome-core/15 text-black font-medium">
            {sourceLabel}
          </span>
          {listing.beds && <Badge color="gray" className="text-[11px]">{listing.beds} bd</Badge>}
          {listing.baths && <Badge color="gray" className="text-[11px]">{listing.baths} ba</Badge>}
        </div>

        {isExternal ? (
          <a href={listing.url} target="_blank" rel="noopener noreferrer">
            <p className="font-semibold text-gray-900 hover:text-roome-core transition-colors line-clamp-2">
              {displayTitle}
            </p>
          </a>
        ) : (
          <p className="font-semibold text-gray-900 line-clamp-2">{displayTitle}</p>
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
            className="flex-1 inline-flex items-center justify-center gap-2 text-black"
            onClick={() => setShareOpen(true)}
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="inline-flex items-center justify-center gap-2 text-black"
            onClick={() => setMoveOpen(true)}
          >
            <Folder className="w-3.5 h-3.5" />
            Move
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="inline-flex items-center justify-center gap-2 text-black"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
            <h3 className="font-bold text-lg mb-4">Edit Listing</h3>
            <div className="space-y-3">
              <Input label="Title / Address" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Rent"
                  value={editRent}
                  onChange={(e) => setEditRent(e.target.value.replace(/[^\d]/g, ""))}
                />
                <Input
                  label="Utilities"
                  value={editUtilities}
                  onChange={(e) => setEditUtilities(e.target.value.replace(/[^\d]/g, ""))}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <select
                  value={editBeds}
                  onChange={(e) => setEditBeds(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-roome-offwhite text-roome-black border border-transparent focus:outline-none"
                >
                  <option value="">Beds</option>
                  {BEDS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <select
                  value={editBaths}
                  onChange={(e) => setEditBaths(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-roome-offwhite text-roome-black border border-transparent focus:outline-none"
                >
                  <option value="">Baths</option>
                  {BATHS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <select
                  value={editLease}
                  onChange={(e) => setEditLease(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-roome-offwhite text-roome-black border border-transparent focus:outline-none"
                >
                  <option value="">Lease</option>
                  {LEASE_LENGTH_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <Input label="Move-in Date" value={editMoveIn} onChange={(e) => setEditMoveIn(e.target.value)} />
              <div>
                <label className="text-xs text-gray-500">Notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-roome-offwhite text-roome-black border border-transparent focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={saveEdits} loading={savingEdit}>Save</Button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}
