import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sendMessageEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.slice(7) ?? null;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (!user || authError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { toUID, text } = await req.json();

    const { data: sender } = await supabaseAdmin
      .from("profiles").select("name").eq("id", user.id).single();
    const senderName = sender?.name ?? "Someone";
    const preview = text.length > 80 ? text.slice(0, 80) + "…" : text;

    const { data: recipient } = await supabaseAdmin
      .from("profiles").select("email, notifyMessages").eq("id", toUID).single();

    if (recipient?.notifyMessages !== false) {
      await supabaseAdmin.from("notifications").insert({
        toUID, fromUID: user.id, type: "message",
        title: `New message from ${senderName}`,
        body: preview,
        read: false, createdAt: new Date().toISOString(),
      });
      if (recipient?.email) {
        sendMessageEmail(recipient.email, senderName, preview).catch(() => {});
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed" }, { status: 500 });
  }
}
