"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { SavedListing } from "@/types/listings";

export function useListingsByLocation(city?: string, neighborhood?: string) {
  const [listings, setListings] = useState<SavedListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If either dropdown isn't selected yet, don't query
    if (!city || !neighborhood) {
      setListings([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    let active = true;
    const fetch = async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("city", city)
        .eq("neighborhood", neighborhood);
      if (!active) return;
      if (error) {
        console.error("Error fetching listings:", error);
        setListings([]);
      } else {
        setListings(data as SavedListing[]);
      }
      setLoading(false);
    };
    fetch();

    const channel = supabase
      .channel(`listings:${city}:${neighborhood}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "listings" }, () => fetch())
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [city, neighborhood]);

  return { listings, loading };
}
