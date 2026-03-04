import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { uid } = await req.json();
    if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

    const supabase = getSupabaseAdmin();

    // Return existing code if the user already has one
    const { data: profile } = await supabase
      .from("profiles")
      .select("inviteCode")
      .eq("id", uid)
      .single();

    if (profile?.inviteCode) {
      return NextResponse.json({ code: profile.inviteCode });
    }

    // Generate a new 6-char alphanumeric code
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const code = Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");

    await supabase.from("profiles").update({ inviteCode: code }).eq("id", uid);

    return NextResponse.json({ code });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed" }, { status: 500 });
  }
}
