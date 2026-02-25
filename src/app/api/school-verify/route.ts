import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { userId, schoolEmail } = await req.json();
    if (!userId || !schoolEmail) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ schoolEmail, schoolVerified: true })
      .eq("id", userId);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed" }, { status: 500 });
  }
}
