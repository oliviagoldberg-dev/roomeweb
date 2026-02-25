"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Trash2, Share2 } from "lucide-react";
import { deleteSavedListing, sendMessage, ensureConversation } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { useConversations } from "@/hooks/useConversations";
import { SavedListing } from "@/types/listings";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import * as Dialog from "@radix-ui/react-dialog";
import { Avatar } from "@/components/ui/Avatar";
import { useRouter } from "next/navigation";
import { formatSourceLabel } from "@/lib/utils/formatSource";

interface SavedListingCardProps {
  listing: SavedListing;
}

export function SavedListingCard({ listing }: SavedListingCardProps) {
  const router = useRouter();
  const { uid } = useAuthStore();
  const { convos } = useConversations();
  const [shareOpen, setShareOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const [previewImage, setPreviewImage] = useState("");
  const coverPhoto = listing.photoURLs?.[0] ?? listing.imageUrl ?? previewImage;
  const isExternal = listing.url && listing.source !== "Manual";
  const sourceLabel = formatSourceLabel(listing.source);

  useEffect(() => {
    if (coverPhoto || !listing.url) return;
    let cancelled = false;
    async function fetchPreviewImage() {
      try {
        const res = await fetch("/api/link-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: listing.url }),
        });
        const data = await res.json();
        if (!cancelled && data?.imageUrl) setPreviewImage(data.imageUrl as string);
      } catch {
        // no-op
      }
    }
    void fetchPreviewImage();
    return () => { cancelled = true; };
  }, [coverPhoto, listing.url]);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Cover image */}
      {isExternal ? (
        <a href={listing.url} target="_blank" rel="noopener noreferrer">
          <CoverImage src={coverPhoto} title={listing.title} />
        </a>
      ) : (
        <CoverImage src={coverPhoto} title={listing.title} />
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

        {/* Rent */}
        {listing.rent != null && (
          <p className="text-roome-core font-bold text-lg">
            ${listing.rent.toLocaleString()}/mo
            {listing.utilities != null && (
              <span className="text-sm font-normal text-gray-400 ml-1">
                + ${listing.utilities}/mo utilities
              </span>
            )}
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
            onClick={() => setShareOpen(true)}
            className="flex-1 inline-flex items-center justify-center gap-2"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Share to chat dialog */}
      <Dialog.Root open={shareOpen} onOpenChange={(o) => { if (!o) setShareOpen(false); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
          <Dialog.Content className="fixed inset-x-4 top-1/4 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-sm bg-white rounded-3xl shadow-2xl z-50 p-6">
            <Dialog.Title className="font-bold text-lg mb-4">Share to Chat</Dialog.Title>
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
            <Dialog.Close asChild>
              <Button variant="secondary" className="w-full mt-4">Cancel</Button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function CoverImage({ src, title }: { src: string; title: string }) {
  if (!src) {
    return (
      <div className="w-full h-40 bg-gradient-to-br from-roome-deep to-roome-core flex items-center justify-center">
        <span className="text-white text-sm font-medium opacity-60">No photo</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={title}
      className="w-full h-40 object-cover"
      onError={(e) => {
        const img = e.target as HTMLImageElement;
        img.style.display = "none";
        const div = document.createElement("div");
        div.className = "w-full h-40 bg-gradient-to-br from-roome-deep to-roome-core flex items-center justify-center";
        div.innerHTML = '<span class="text-white text-sm font-medium opacity-60">No photo</span>';
        img.parentElement?.insertBefore(div, img);
      }}
    />
  );
}
