"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";

const FREE_FEATURES = [
  "Browse all roommate profiles",
  "Up to 10 likes / connections",
  "Limited messaging (10 messages)",
];

const PREMIUM_FEATURES = [
  "Unlimited likes & connections",
  "Unlimited messaging",
  "Profile boosted to top of browse grid",
  "Priority support",
];

export default function PricingPage() {
  const { uid } = useAuthStore();
  const { isPremium } = useSubscription();
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    if (!uid) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black">Simple pricing</h1>
        <p className="text-gray-500">Find your perfect roommate, free or with a boost.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Free */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Free</p>
            <p className="text-3xl font-black mt-1">$0</p>
          </div>
          <ul className="space-y-2">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <div className="pt-2">
            <Button variant="secondary" className="w-full" disabled>
              {isPremium ? "Your previous plan" : "Current plan"}
            </Button>
          </div>
        </div>

        {/* Premium */}
        <div className="bg-roome-core rounded-3xl shadow-lg p-6 space-y-4 text-white">
          <div>
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Premium</p>
            <div className="flex items-baseline gap-1 mt-1">
              <p className="text-3xl font-black">$9.99</p>
              <p className="text-sm text-white/70">/month</p>
            </div>
          </div>
          <ul className="space-y-2">
            {PREMIUM_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-white/90">
                <Check className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <div className="pt-2">
            {isPremium ? (
              <button disabled className="w-full bg-white text-roome-core font-semibold px-5 py-2.5 text-sm rounded-2xl opacity-70">
                Current plan ✦
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full bg-white text-roome-core font-semibold px-5 py-2.5 text-sm rounded-2xl hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Loading…" : "Upgrade to Premium"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
