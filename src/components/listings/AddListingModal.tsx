"use client";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import toast from "react-hot-toast";
import { saveListing } from "@/lib/firebase/firestore";
import { uploadListingPhotos } from "@/lib/firebase/storage";
import { useAuthStore } from "@/store/authStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LinkPreviewResult } from "@/types/listings";
import { LinkPreview } from "./LinkPreview";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { SavedListing } from "@/types/listings";
import {
  BEDS_OPTIONS,
  BATHS_OPTIONS,
  LEASE_LENGTH_OPTIONS,
} from "@/lib/utils/constants";

const AMENITIES_OPTIONS = ["AC", "In-unit Laundry", "Parking", "Dishwasher", "Gym", "Pool", "Pet Friendly", "Furnished", "Rooftop", "Doorman"];

interface AddListingModalProps {
  open: boolean;
  onClose: () => void;
  defaultFolderId?: string | null;
}

export function AddListingModal({ open, onClose, defaultFolderId }: AddListingModalProps) {
  const { uid } = useAuthStore();
  const { user } = useCurrentUser();
  const [tab, setTab] = useState<"url" | "manual">("url");

  // URL tab state
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<LinkPreviewResult | null>(null);
  const [fetching, setFetching] = useState(false);

  // Manual tab state
  const [address, setAddress] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [rent, setRent] = useState("");
  const [utilities, setUtilities] = useState("");
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [leaseLength, setLeaseLength] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const normalizeNumberInput = (value: string) => value.replace(/[^\d]/g, "");

  async function fetchPreview() {
    if (!url.trim()) return;
    setFetching(true);
    setPreview(null);
    try {
      const res = await fetch("/api/link-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPreview(data as LinkPreviewResult);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not fetch preview");
    } finally {
      setFetching(false);
    }
  }

  async function handleSaveUrl() {
    if (!uid || !preview) return;
    setSaving(true);
    try {
      const listingId = await saveListing(uid, {
        ownerUid: uid,
        url,
        ...preview,
        title: address.trim() || preview.title,
        city: user?.city ?? "",
        neighborhood: user?.neighborhood ?? "",
        rent: preview.rent ?? undefined,
        ...(defaultFolderId != null ? { folderId: defaultFolderId } : {}),
      } as Omit<SavedListing, "id">);
      void fetch("/api/notify-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      toast.success("Listing saved!");
      handleClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save listing");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveManual() {
    if (!uid || !address.trim()) {
      toast.error("Address is required");
      return;
    }
    setSaving(true);
    try {
      let photoURLs: string[] = [];
      if (photoFiles.length) {
        photoURLs = await uploadListingPhotos(uid, photoFiles);
      }
      const listingId = await saveListing(uid, {
        ownerUid: uid,
        url: manualUrl,
        title: address.trim(),
        imageUrl: photoURLs[0] ?? "",
        description: notes,
        source: "Manual",
        city: user?.city ?? "",
        neighborhood: user?.neighborhood ?? "",
        rent: rent ? Number(rent) : undefined,
        utilities: utilities ? Number(utilities) : undefined,
        beds,
        baths,
        leaseLength,
        moveInDate,
        amenities,
        photoURLs,
        notes,
        ...(defaultFolderId != null ? { folderId: defaultFolderId } : {}),
      } as Omit<SavedListing, "id">);
      void fetch("/api/notify-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      toast.success("Listing posted!");
      handleClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save listing");
    } finally {
      setSaving(false);
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 6);
    setPhotoFiles(files);
    setPhotoPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  function toggleAmenity(a: string) {
    setAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  }

  function handleClose() {
    setUrl(""); setPreview(null);
    setAddress(""); setManualUrl(""); setRent(""); setUtilities("");
    setBeds(""); setBaths(""); setLeaseLength(""); setMoveInDate("");
    setAmenities([]); setNotes(""); setPhotoFiles([]); setPhotoPreviews([]);
    onClose();
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed inset-x-4 top-[5%] bottom-[5%] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <Dialog.Title className="text-xl font-bold">Add a Listing</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </Dialog.Close>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setTab("url")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === "url" ? "text-roome-core border-b-2 border-roome-core" : "text-gray-400"
              }`}
            >
              Import from URL
            </button>
            <button
              onClick={() => setTab("manual")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === "manual" ? "text-roome-core border-b-2 border-roome-core" : "text-gray-400"
              }`}
            >
              Post Manually
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {tab === "url" ? (
              <>
                <p className="text-sm text-gray-500">
                  Paste a Zillow, Apartments.com, or any listing URL.
                </p>
                <Input
                  label="Address (optional)"
                  placeholder="123 Main St, Nashville, TN"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://zillow.com/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="secondary" onClick={fetchPreview} loading={fetching} disabled={!url.trim()}>
                    Preview
                  </Button>
                </div>
                {preview && <LinkPreview preview={preview} url={url} />}
              </>
            ) : (
              <>
                {/* Photos */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Photos</label>
                  {photoPreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {photoPreviews.map((src, i) => (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden bg-roome-pale">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="block">
                    <span className="inline-block bg-roome-pale text-roome-deep text-sm font-semibold px-4 py-2 rounded-xl cursor-pointer hover:opacity-80 transition">
                      {photoFiles.length ? `${photoFiles.length} photo${photoFiles.length > 1 ? "s" : ""} selected` : "Upload Photos"}
                    </span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoChange} />
                  </label>
                </div>

                <Input
                  label="Address"
                  placeholder="123 Main St, Nashville, TN"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />

                <Input label="Listing URL (optional)" type="url" placeholder="https://..." value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)} />

                <div className="grid grid-cols-2 gap-3">
                  <Input label="Rent / mo" type="number" placeholder="1200" value={rent}
                    onChange={(e) => setRent(normalizeNumberInput(e.target.value))} />
                  <Input label="Utilities / mo" type="number" placeholder="100" value={utilities}
                    onChange={(e) => setUtilities(normalizeNumberInput(e.target.value))} />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Bedrooms</label>
                  <div className="flex flex-wrap gap-2">
                    {BEDS_OPTIONS.map((opt) => (
                      <button key={opt} type="button" onClick={() => setBeds(opt)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                          beds === opt ? "bg-roome-core text-white" : "bg-roome-pale text-roome-deep"
                        }`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Bathrooms</label>
                  <div className="flex flex-wrap gap-2">
                    {BATHS_OPTIONS.map((opt) => (
                      <button key={opt} type="button" onClick={() => setBaths(opt)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                          baths === opt ? "bg-roome-core text-white" : "bg-roome-pale text-roome-deep"
                        }`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Lease Length</label>
                  <div className="flex flex-wrap gap-2">
                    {LEASE_LENGTH_OPTIONS.map((opt) => (
                      <button key={opt} type="button" onClick={() => setLeaseLength(opt)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                          leaseLength === opt ? "bg-roome-core text-white" : "bg-roome-pale text-roome-deep"
                        }`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Move-in Date</label>
                  <input type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-roome-offwhite border border-transparent focus:outline-none focus:ring-2 focus:ring-roome-core/40 text-sm" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Amenities</label>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES_OPTIONS.map((a) => (
                      <button key={a} type="button" onClick={() => toggleAmenity(a)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                          amenities.includes(a) ? "bg-roome-core text-white" : "bg-roome-pale text-roome-deep"
                        }`}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">Notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                    placeholder="Any additional details about this listing..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl bg-roome-offwhite border border-transparent resize-none focus:outline-none focus:ring-2 focus:ring-roome-core/40 text-sm" />
                  <p className="text-xs text-gray-400 text-right">{notes.length}/500</p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100">
            {tab === "url" ? (
              <Button onClick={handleSaveUrl} loading={saving} className="w-full" disabled={!preview}>
                Save Listing
              </Button>
            ) : (
              <Button onClick={handleSaveManual} loading={saving} className="w-full" disabled={!address.trim()}>
                Post Listing
              </Button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
