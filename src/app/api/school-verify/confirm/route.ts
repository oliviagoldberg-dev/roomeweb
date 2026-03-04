import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { uid, code } = await req.json();
    if (!uid || !code) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data: profile } = await supabase
      .from("profiles")
      .select("schoolVerifyCode, schoolVerifyExpiry")
      .eq("id", uid)
      .single();

    if (!profile?.schoolVerifyCode) return NextResponse.json({ error: "No code found" }, { status: 400 });
    if (profile.schoolVerifyCode !== code) return NextResponse.json({ error: "Incorrect code" }, { status: 400 });
    if (new Date(profile.schoolVerifyExpiry) < new Date()) return NextResponse.json({ error: "Code expired" }, { status: 400 });

    await supabase.from("profiles").update({
      schoolVerified: true,
      schoolVerifyCode: null,
      schoolVerifyExpiry: null,
    }).eq("id", uid);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed" }, { status: 500 });
  }
}
