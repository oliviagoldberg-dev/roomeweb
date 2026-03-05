import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { uid, schoolEmail } = await req.json();
    if (!uid || !schoolEmail) return NextResponse.json({ error: "Missing data" }, { status: 400 });
    if (!schoolEmail.endsWith(".edu")) return NextResponse.json({ error: "Must be a .edu email" }, { status: 400 });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

    const supabase = getSupabaseAdmin();
    await supabase.from("profiles").update({
      schoolVerifyCode: code,
      schoolVerifyExpiry: expiresAt,
      schoolEmail,
    }).eq("id", uid);

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: resendError } = await resend.emails.send({
      from: "ROOMe <hello@roomeofficial.com>",
      to: schoolEmail,
      subject: "Your ROOMe school verification code",
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px">
          <h2 style="font-size:24px;font-weight:900;margin-bottom:8px">Verify your school email</h2>
          <p style="color:#666;margin-bottom:24px">Enter this code in the ROOMe app to verify your school email address.</p>
          <div style="background:#f4f4f5;border-radius:12px;padding:24px;text-align:center;font-size:36px;font-weight:900;letter-spacing:8px">${code}</div>
          <p style="color:#999;font-size:12px;margin-top:16px">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    if (resendError) {
      console.error("Resend error:", resendError);
      return NextResponse.json({ error: resendError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed" }, { status: 500 });
  }
}
