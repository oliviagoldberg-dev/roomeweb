import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.slice(7) ?? null;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (!user || authError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { toUID } = await req.json();

    const { error } = await supabaseAdmin
      .from("friendrequests")
      .insert({ fromUID: user.id, toUID, status: "pending", timestamp: new Date().toISOString() });
    if (error) throw error;

    const { data: prefs } = await supabaseAdmin
      .from("profiles").select("notifyFriendRequests").eq("id", toUID).single();
    if (prefs?.notifyFriendRequests !== false) {
      const { data: sender } = await supabaseAdmin
        .from("profiles").select("name").eq("id", user.id).single();
      await supabaseAdmin.from("notifications").insert({
        toUID, fromUID: user.id, type: "friend_request",
        title: "New friend request",
        body: `${sender?.name ?? "Someone"} sent you a friend request.`,
        read: false, createdAt: new Date().toISOString(),
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed" }, { status: 500 });
  }
}
