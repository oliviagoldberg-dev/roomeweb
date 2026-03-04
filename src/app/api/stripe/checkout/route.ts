import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const { uid } = await req.json();
  if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripeCustomerId, email, name")
    .eq("id", uid)
    .single();

  let customerId = profile?.stripeCustomerId as string | undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? undefined,
      name: profile?.name ?? undefined,
      metadata: { uid },
    });
    customerId = customer.id;
    await supabase.from("profiles").update({ stripeCustomerId: customerId }).eq("id", uid);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://roomeofficial.com"}/auth/stripe-return?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://roomeofficial.com"}/auth/stripe-return?canceled=true`,
    metadata: { uid },
  });

  return NextResponse.json({ url: session.url });
}
