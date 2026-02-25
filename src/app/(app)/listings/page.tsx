"use client";

import { useUiStore } from "@/store/uiStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSavedListings } from "@/hooks/useSavedListings";
import { SavedListingCard } from "@/components/listings/SavedListingCard";
import { AddListingModal } from "@/components/listings/AddListingModal";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Home } from "lucide-react";

export default function ListingsPage() {
  const { user } = useCurrentUser();
  const { listings, loading } = useSavedListings();
  const { addListingModalOpen, setAddListingModalOpen } = useUiStore();

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Saved Listings</h1>
          <p className="text-sm text-gray-500">
            Save and share apartments with your matches
          </p>
        </div>

        <Button onClick={() => setAddListingModalOpen(true)} size="sm" className="bg-[#38b6ff] hover:bg-[#2ea6f0] text-white">
          + Add Listing
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center pt-16">
          <LoadingSpinner />
        </div>
      ) : listings.length === 0 ? (
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
          {listings.map((l) => (
            <SavedListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}

      <AddListingModal
        open={addListingModalOpen}
        onClose={() => setAddListingModalOpen(false)}
      />
    </div>
  );
}
