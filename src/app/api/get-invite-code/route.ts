import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabaseAdmin = getSupabaseAdmin();

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (!user || authError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Return existing code if already has one
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("inviteCode")
      .eq("id", user.id)
      .single();

    if (profile?.inviteCode) {
      return NextResponse.json({ code: profile.inviteCode });
    }

    // Generate a new code
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

    await supabaseAdmin.from("profiles").update({ inviteCode: code }).eq("id", user.id);
    await supabaseAdmin.from("inviteCodes").insert({ code, uid: user.id, createdAt: new Date().toISOString() });

    return NextResponse.json({ code });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed" }, { status: 500 });
  }
}
