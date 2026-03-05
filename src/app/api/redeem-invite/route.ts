import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { code, newUserUid } = await req.json();
    if (!code || !newUserUid) return NextResponse.json({ error: "Missing params" }, { status: 400 });

    const supabaseAdmin = getSupabaseAdmin();

    // Validate invite code → find inviter
    const { data: inviter } = await supabaseAdmin
      .from("profiles").select("id").eq("inviteCode", code.trim().toUpperCase()).single();
    if (!inviter || inviter.id === newUserUid) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    // Verify new user exists in auth (prevents spoofing)
    const { data: { user: newUser } } = await supabaseAdmin.auth.admin.getUserById(newUserUid);
    if (!newUser) return NextResponse.json({ error: "User not found" }, { status: 400 });

    // Guard against duplicate friendships
    const { data: existing } = await supabaseAdmin
      .from("friendships")
      .select("id")
      .contains("users", [newUserUid])
      .contains("users", [inviter.id])
      .maybeSingle();

    if (!existing) {
      const { error } = await supabaseAdmin.from("friendships").insert({
        users: [newUserUid, inviter.id], createdAt: new Date().toISOString(),
      });
      if (error) throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed" }, { status: 500 });
  }
}
