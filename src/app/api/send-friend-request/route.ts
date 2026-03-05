import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sendFriendRequestEmail } from "@/lib/email";

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

    const { data: sender } = await supabaseAdmin
      .from("profiles").select("name").eq("id", user.id).single();
    const senderName = sender?.name ?? "Someone";

    const { data: recipient } = await supabaseAdmin
      .from("profiles").select("email, notifyFriendRequests").eq("id", toUID).single();

    if (recipient?.notifyFriendRequests !== false) {
      await supabaseAdmin.from("notifications").insert({
        toUID, fromUID: user.id, type: "friend_request",
        title: "New friend request",
        body: `${senderName} sent you a friend request.`,
        read: false, createdAt: new Date().toISOString(),
      });
      if (recipient?.email) {
        sendFriendRequestEmail(recipient.email, senderName).catch(() => {});
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed" }, { status: 500 });
  }
}
