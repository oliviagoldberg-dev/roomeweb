import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const uid = session.metadata?.uid;
    if (!uid) return NextResponse.json({ error: "No uid in metadata" }, { status: 400 });

    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;

    await supabase.from("profiles").update({
      subscriptionTier: "premium",
      boostActive: true,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
    }).eq("id", uid);
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    await supabase.from("profiles").update({
      subscriptionTier: "free",
      boostActive: false,
      stripeSubscriptionId: null,
    }).eq("stripeCustomerId", customerId);
  }

  return NextResponse.json({ received: true });
}
