"use client";
import { supabase } from "@/lib/supabase/client";

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUser(uid: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function ensureProfile(uid: string, email?: string, name?: string) {
  const existing = await getUser(uid);
  if (existing) return existing;

  const username = email ? email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "") : uid.slice(0, 8);
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: uid,
      uid,
      email: email ?? "",
      name: name ?? "",
      username,
      phone: "",
      age: "",
      occupation: "",
      company: "",
      companyIndustry: "",
      school: "",
      university: "",
      hometown: "",
      city: "",
      moveCity: "",
      neighborhood: "",
      neighborhoodPreferences: [],
      bio: "",
      budgetMin: 0,
      budgetMax: 0,
      beds: "",
      baths: "",
      leaseLength: "",
      furnished: false,
      hasAC: false,
      hasLaundry: false,
      hasParking: false,
      hasPet: false,
      smokes: false,
      host: false,
      cleanliness: 3,
      sleepSchedule: "",
      workFromHome: "",
      connections: [],
      likedBy: [],
      photoURLs: [],
      profileImageURL: "",
      onboardingComplete: false,
    }, { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateUser(uid: string, data: Record<string, unknown>) {
  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", uid);
  if (error) throw error;
}

export async function fetchUsersInCity(city: string, excludeUid: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("city", city)
    .eq("onboardingComplete", true)
    .neq("id", excludeUid);
  if (error) return [];
  return data ?? [];
}

// ─── Block / Report ───────────────────────────────────────────────────────────

export async function listBlockedUsers(uid: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("blocks")
    .select("blockedUid")
    .eq("blockerUid", uid);
  if (error) return [];
  return (data ?? []).map((r: any) => r.blockedUid).filter(Boolean);
}

export async function blockUser(blockerUid: string, blockedUid: string) {
  const { error } = await supabase
    .from("blocks")
    .insert({ blockerUid, blockedUid, createdAt: new Date().toISOString() });
  if (error) throw error;
}

export async function unblockUser(blockerUid: string, blockedUid: string) {
  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("blockerUid", blockerUid)
    .eq("blockedUid", blockedUid);
  if (error) throw error;
}

export async function reportUser(reporterUid: string, reportedUid: string, reason: string) {
  const { error } = await supabase
    .from("reports")
    .insert({ reporterUid, reportedUid, reason, createdAt: new Date().toISOString() });
  if (error) throw error;
}

export async function searchUsersByUsername(prefix: string, currentUid: string, cb: (results: unknown[]) => void) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", `${prefix.toLowerCase()}%`)
    .limit(10);
  cb(data ?? []);
  return;
}

// ─── Like / Match ─────────────────────────────────────────────────────────────

export async function likeUser(myUid: string, targetUid: string): Promise<boolean> {
  const { data: target, error: targetErr } = await supabase
    .from("profiles")
    .select("likedBy")
    .eq("id", targetUid)
    .single();
  if (targetErr) throw targetErr;

  const newLikedBy = Array.from(new Set([...(target?.likedBy ?? []), myUid]));
  await supabase.from("profiles").update({ likedBy: newLikedBy }).eq("id", targetUid);

  const { data: me } = await supabase
    .from("profiles")
    .select("likedBy")
    .eq("id", myUid)
    .single();
  const myLikedBy: string[] = me?.likedBy ?? [];
  const mutual = myLikedBy.includes(targetUid);

  if (mutual) {
    const { data: meConn } = await supabase
      .from("profiles")
      .select("connections")
      .eq("id", myUid)
      .single();
    const { data: targetConn } = await supabase
      .from("profiles")
      .select("connections")
      .eq("id", targetUid)
      .single();

    const myConnections = Array.from(new Set([...(meConn?.connections ?? []), targetUid]));
    const theirConnections = Array.from(new Set([...(targetConn?.connections ?? []), myUid]));

    await supabase.from("profiles").update({ connections: myConnections }).eq("id", myUid);
    await supabase.from("profiles").update({ connections: theirConnections }).eq("id", targetUid);
    return true;
  }
  return false;
}

// ─── Conversations ────────────────────────────────────────────────────────────

export function makeConvoId(uid1: string, uid2: string) {
  return [uid1, uid2].sort().join("_");
}

export function listenToConversations(uid: string, cb: (rows: any[]) => void) {
  const fetch = async () => {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .contains("participants", [uid])
      .order("lastMessageTime", { ascending: false });
    cb(data ?? []);
  };
  fetch();

  const channel = supabase
    .channel(`conversations:${uid}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "conversations" },
      () => fetch()
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function ensureConversation(myUid: string, otherUid: string) {
  const convoId = makeConvoId(myUid, otherUid);
  const { data } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", convoId)
    .maybeSingle();
  if (!data) {
    await supabase.from("conversations").insert({
      id: convoId,
      participants: [myUid, otherUid],
      lastMessage: "",
      lastMessageTime: new Date().toISOString(),
      unreadCount: { [myUid]: 0, [otherUid]: 0 },
    });
  }
  return convoId;
}

export function listenToMessages(convoId: string, cb: (rows: any[]) => void) {
  const fetch = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("convoId", convoId)
      .order("createdAt", { ascending: true });
    cb(data ?? []);
  };
  fetch();

  const channel = supabase
    .channel(`messages:${convoId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "messages", filter: `convoId=eq.${convoId}` },
      () => fetch()
    )
    .subscribe();

  const poll = setInterval(fetch, 3000);
  return () => {
    clearInterval(poll);
    void supabase.removeChannel(channel);
  };
}

export async function sendMessage(
  convoId: string,
  senderUID: string,
  otherUID: string,
  text: string,
  isLink = false,
  listing?: { title: string; imageUrl: string; description: string; source: string }
) {
  const { error } = await supabase.from("messages").insert({
    convoId,
    senderUID,
    text,
    isLink,
    listing,
    createdAt: new Date().toISOString(),
  });
  if (error) throw error;

  const { data } = await supabase
    .from("conversations")
    .select("unreadCount")
    .eq("id", convoId)
    .single();
  const unread = data?.unreadCount ?? {};
  const newUnread = { ...unread, [otherUID]: (unread?.[otherUID] ?? 0) + 1 };

  await supabase.from("conversations").update({
    participants: [senderUID, otherUID],
    lastMessage: text,
    lastMessageTime: new Date().toISOString(),
    unreadCount: newUnread,
  }).eq("id", convoId);
}

export async function markConversationRead(convoId: string, uid: string) {
  const { data } = await supabase
    .from("conversations")
    .select("unreadCount")
    .eq("id", convoId)
    .single();
  const unread = data?.unreadCount ?? {};
  const newUnread = { ...unread, [uid]: 0 };
  await supabase.from("conversations").update({ unreadCount: newUnread }).eq("id", convoId);
}

// ─── Friends ──────────────────────────────────────────────────────────────────

export function listenToFriendships(uid: string, cb: (rows: any[]) => void) {
  const fetch = async () => {
    const { data } = await supabase
      .from("friendships")
      .select("*")
      .contains("users", [uid]);
    cb(data ?? []);
  };
  fetch();
  const channel = supabase
    .channel(`friendships:${uid}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, () => fetch())
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

export function listenToFriendRequests(uid: string, cb: (rows: any[]) => void) {
  const fetch = async () => {
    const { data } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("toUID", uid)
      .eq("status", "pending");
    cb(data ?? []);
  };
  fetch();
  const channel = supabase
    .channel(`friend_requests:${uid}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "friend_requests" }, () => fetch())
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function sendFriendRequest(fromUID: string, toUID: string) {
  await supabase.from("friend_requests").insert({
    fromUID,
    toUID,
    status: "pending",
    timestamp: new Date().toISOString(),
  });
}

export async function acceptFriendRequest(requestId: string, myUid: string, fromUid: string) {
  await supabase.from("friend_requests").update({ status: "accepted" }).eq("id", requestId);
  await supabase.from("friendships").insert({
    users: [myUid, fromUid],
    createdAt: new Date().toISOString(),
  });
}

export async function declineFriendRequest(requestId: string) {
  await supabase.from("friend_requests").update({ status: "declined" }).eq("id", requestId);
}

// ─── Invite Codes ─────────────────────────────────────────────────────────────

export async function getOrCreateInviteCode(uid: string): Promise<string> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("inviteCode")
    .eq("id", uid)
    .single();
  if (existing?.inviteCode) return existing.inviteCode as string;

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

  await supabase.from("profiles").update({ inviteCode: code }).eq("id", uid);
  await supabase.from("invite_codes").insert({ code, uid, createdAt: new Date().toISOString() });
  return code;
}

export async function validateInviteCode(code: string): Promise<string | null> {
  const { data } = await supabase
    .from("invite_codes")
    .select("uid")
    .eq("code", code.trim().toUpperCase())
    .single();
  return data?.uid ?? null;
}

export async function redeemInviteCode(code: string, newUserUid: string): Promise<boolean> {
  const inviterUid = await validateInviteCode(code);
  if (!inviterUid || inviterUid === newUserUid) return false;
  await supabase.from("friendships").insert({
    users: [newUserUid, inviterUid],
    createdAt: new Date().toISOString(),
  });
  return true;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export function listenToNotifications(uid: string, cb: (rows: any[]) => void) {
  const fetch = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("toUID", uid)
      .order("createdAt", { ascending: false })
      .limit(50);
    cb(data ?? []);
  };
  fetch();
  const channel = supabase
    .channel(`notifications:${uid}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `toUID=eq.${uid}` }, () => fetch())
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

// ─── Saved Listings ───────────────────────────────────────────────────────────

export async function saveListing(
  ownerUid: string,
  listing: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from("listings")
    .insert({
      ...listing,
      ownerUid,
      createdAt: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function deleteSavedListing(id: string) {
  await supabase.from("listings").delete().eq("id", id);
}

export function listenToSavedListings(uid: string, cb: (rows: any[]) => void) {
  const fetch = async () => {
    const { data } = await supabase
      .from("listings")
      .select("*")
      .eq("ownerUid", uid)
      .order("createdAt", { ascending: false });
    cb(data ?? []);
  };
  fetch();
  const channel = supabase
    .channel(`listings:${uid}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "listings", filter: `ownerUid=eq.${uid}` }, () => fetch())
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}


// ─── Listing Folders ─────────────────────────────────────────────────────────

export async function createListingFolder(ownerUid: string, name: string) {
  const { data, error } = await supabase
    .from("listingfolders")
    .insert({ ownerUid, name, createdAt: new Date().toISOString() })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateListingFolder(listingId: string, folderId: string | null) {
  const { error } = await supabase
    .from("listings")
    .update({ folderId })
    .eq("id", listingId);
  if (error) throw error;
}

export async function shareListingFolder(folderId: string, ownerUid: string, sharedWithUid: string) {
  const { error } = await supabase
    .from("foldershares")
    .insert({ folderId, ownerUid, sharedWithUid, createdAt: new Date().toISOString() });
  if (error) throw error;
}

export async function listFolderShares(folderId: string) {
  const { data } = await supabase
    .from("foldershares")
    .select("*")
    .eq("folderId", folderId);
  return data ?? [];
}

export async function deleteListingFolder(folderId: string) {
  // Remove folder from listings first
  await supabase.from("listings").update({ folderId: null }).eq("folderId", folderId);
  // Remove shares, then folder
  await supabase.from("foldershares").delete().eq("folderId", folderId);
  const { error } = await supabase.from("listingfolders").delete().eq("id", folderId);
  if (error) throw error;
}

export function listenToListingFolders(uid: string, cb: (rows: any[]) => void) {
  const fetch = async () => {
    const { data: owned } = await supabase
      .from("listingfolders")
      .select("*")
      .eq("ownerUid", uid)
      .order("createdAt", { ascending: true });

    const { data: shares } = await supabase
      .from("foldershares")
      .select("folderId")
      .eq("sharedWithUid", uid);

    const sharedIds = (shares ?? []).map((s: any) => s.folderId).filter(Boolean);
    let shared: any[] = [];
    if (sharedIds.length) {
      const { data: sharedRows } = await supabase
        .from("listingfolders")
        .select("*")
        .in("id", sharedIds);
      shared = sharedRows ?? [];
    }

    const merged = [...(owned ?? []), ...shared].reduce((acc: any[], row: any) => {
      if (!acc.find((r) => r.id === row.id)) acc.push(row);
      return acc;
    }, []);
    cb(merged);
  };

  fetch();
  const channel = supabase
    .channel(`listingfolders:${uid}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "listingfolders" }, () => fetch())
    .on("postgres_changes", { event: "*", schema: "public", table: "foldershares" }, () => fetch())
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

export function listenToListingsForUser(uid: string, cb: (rows: any[]) => void) {
  const fetch = async () => {
    const { data: owned } = await supabase
      .from("listings")
      .select("*")
      .eq("ownerUid", uid)
      .order("createdAt", { ascending: false });

    const { data: shares } = await supabase
      .from("foldershares")
      .select("folderId")
      .eq("sharedWithUid", uid);
    const sharedIds = (shares ?? []).map((s: any) => s.folderId).filter(Boolean);

    let sharedListings: any[] = [];
    if (sharedIds.length) {
      const { data } = await supabase
        .from("listings")
        .select("*")
        .in("folderId", sharedIds)
        .order("createdAt", { ascending: false });
      sharedListings = data ?? [];
    }

    const merged = [...(owned ?? []), ...sharedListings].reduce((acc: any[], row: any) => {
      if (!acc.find((r) => r.id === row.id)) acc.push(row);
      return acc;
    }, []);
    cb(merged);
  };

  fetch();
  const channel = supabase
    .channel(`listings-shared:${uid}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "listings" }, () => fetch())
    .on("postgres_changes", { event: "*", schema: "public", table: "foldershares" }, () => fetch())
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
