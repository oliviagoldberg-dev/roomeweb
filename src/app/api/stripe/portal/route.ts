import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { uid } = await req.json();
  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripeCustomerId")
    .eq("id", uid)
    .single();

  const customerId = profile?.stripeCustomerId as string | undefined;
  if (!customerId) return NextResponse.json({ error: "No Stripe customer" }, { status: 400 });

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://roomeofficial.com"}/profile`,
  });

  return NextResponse.json({ url: session.url });
}
