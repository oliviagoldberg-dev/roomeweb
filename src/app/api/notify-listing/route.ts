import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

function matchListingToUser(listing: any, user: any): boolean {
  if (!user?.onboardingComplete) return false;
  if (listing.ownerUid && user.id === listing.ownerUid) return false;

  if (listing.city && user.city && listing.city !== user.city) return false;

  if (listing.neighborhood) {
    const prefs: string[] = user.neighborhoodPreferences ?? [];
    const hasMatch = prefs.includes(listing.neighborhood) || user.neighborhood === listing.neighborhood;
    if (!hasMatch) return false;
  }

  const rent = listing.rent ?? null;
  const min = Number(user.budgetMin ?? 0);
  const max = Number(user.budgetMax ?? 0);
  if (rent != null) {
    if (max > 0 && rent > max) return false;
    if (min > 0 && rent < min) return false;
  }

  if (user.leaseLength && listing.leaseLength && user.leaseLength !== listing.leaseLength) return false;
  if (user.beds && listing.beds && user.beds !== listing.beds) return false;
  if (user.baths && listing.baths && user.baths !== listing.baths) return false;

  const amenities: string[] = listing.amenities ?? [];
  if (user.hasAC && !amenities.includes("AC")) return false;
  if (user.hasLaundry && !amenities.includes("In-unit Laundry")) return false;
  if (user.hasParking && !amenities.includes("Parking")) return false;
  if (user.furnished && !amenities.includes("Furnished")) return false;
  if (user.hasPet && !amenities.includes("Pet Friendly")) return false;

  return true;
}

export async function POST(req: Request) {
  try {
    const { listingId } = await req.json();
    if (!listingId) return NextResponse.json({ error: "Missing listingId" }, { status: 400 });

    const { data: listing, error: listingErr } = await supabaseAdmin
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .single();
    if (listingErr || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const { data: users, error: usersErr } = await supabaseAdmin
      .from("profiles")
      .select("id, city, neighborhood, neighborhoodPreferences, budgetMin, budgetMax, beds, baths, leaseLength, furnished, hasAC, hasLaundry, hasParking, hasPet, onboardingComplete");
    if (usersErr) throw usersErr;

    const matches = (users ?? []).filter((u) => matchListingToUser(listing, u));
    if (matches.length === 0) return NextResponse.json({ ok: true, count: 0 });

    const payload = matches.map((u) => ({
      toUID: u.id,
      fromUID: listing.ownerUid ?? null,
      type: "listing",
      title: "New listing matches your preferences",
      body: listing.title ?? "New apartment listing",
      createdAt: new Date().toISOString(),
      read: false,
    }));

    const { error: notifErr } = await supabaseAdmin.from("notifications").insert(payload);
    if (notifErr) throw notifErr;

    return NextResponse.json({ ok: true, count: payload.length });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed" }, { status: 500 });
  }
}
