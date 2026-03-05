import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.slice(7) ?? null;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (!user || authError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { requestId, fromUID } = await req.json();

    await supabaseAdmin.from("friendrequests").update({ status: "accepted" }).eq("id", requestId);

    // Guard against duplicate friendships
    const { data: existing } = await supabaseAdmin
      .from("friendships")
      .select("id")
      .contains("users", [user.id])
      .contains("users", [fromUID])
      .maybeSingle();
    if (!existing) {
      const { error } = await supabaseAdmin.from("friendships").insert({
        users: [user.id, fromUID], createdAt: new Date().toISOString(),
      });
      if (error) throw error;
    }

    // Notify the original sender
    const { data: prefs } = await supabaseAdmin
      .from("profiles").select("notifyFriendRequests").eq("id", fromUID).single();
    if (prefs?.notifyFriendRequests !== false) {
      const { data: accepter } = await supabaseAdmin
        .from("profiles").select("name, username").eq("id", user.id).single();
      const accepterName = accepter?.name || accepter?.username || "Someone";
      await supabaseAdmin.from("notifications").insert({
        toUID: fromUID, fromUID: user.id, type: "friend_accepted",
        title: "Friend request accepted",
        body: `${accepterName} accepted your friend request.`,
        read: false, createdAt: new Date().toISOString(),
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed" }, { status: 500 });
  }
}
