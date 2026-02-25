"use client";
import { useEffect, useState } from "react";
import { listenToListingsForUser } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { SavedListing } from "@/types/listings";

export function useSavedListings() {
  const uid = useAuthStore((s) => s.uid);
  const [listings, setListings] = useState<SavedListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }

    const unsub = listenToListingsForUser(uid, (rows) => {
      setListings(rows as SavedListing[]);
      setLoading(false);
    });

    return unsub;
  }, [uid]);

  return { listings, loading };
}
