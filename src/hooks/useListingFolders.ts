"use client";
import { useEffect, useRef, useState } from "react";
import { listenToListingFolders, createListingFolder } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import type { ListingFolder } from "@/types/folders";

export function useListingFolders() {
  const uid = useAuthStore((s) => s.uid);
  const [folders, setFolders] = useState<ListingFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const ensuredDefault = useRef(false);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    const unsub = listenToListingFolders(uid, (rows) => {
      setFolders(rows as ListingFolder[]);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  useEffect(() => {
    if (!uid || loading || ensuredDefault.current) return;
    const hasFavorites = folders.some(
      (f) => f.ownerUid === uid && f.name.toLowerCase() === "favorites"
    );
    if (!hasFavorites) {
      ensuredDefault.current = true;
      void createListingFolder(uid, "Favorites");
    }
  }, [folders, loading, uid]);

  async function addFolder(name: string) {
    if (!uid) return;
    await createListingFolder(uid, name);
  }

  return { folders, loading, addFolder };
}
