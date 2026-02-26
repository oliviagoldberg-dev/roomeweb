"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { EmailOtpType } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function SchoolCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Verifying your school email...");

  useEffect(() => {
    async function handleVerify() {
      try {
        const code = searchParams.get("code");
        const tokenHash = searchParams.get("token_hash");
        const type = searchParams.get("type") as EmailOtpType | null;
        const state = searchParams.get("state");
        if (!state) throw new Error("Invalid link");

        let user = null;
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          user = data.session?.user ?? null;
        } else if (tokenHash && type) {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type,
          });
          if (error) throw error;
          user = data.user ?? null;
        } else {
          throw new Error("Invalid link");
        }

        if (!user) throw new Error("No user");

        const { userId, schoolEmail } = JSON.parse(atob(state));
        if (!userId || !schoolEmail) throw new Error("Invalid state");

        await fetch("/api/school-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, schoolEmail }),
        });

        setMessage("School email verified! You can close this tab.");
        setTimeout(() => router.replace("/profile/verification"), 1500);
      } catch {
        setMessage("Verification failed. Please try again.");
      }
    }
    void handleVerify();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-6 text-center max-w-sm w-full">
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        <Button variant="secondary" onClick={() => router.replace("/profile/verification")}>
          Back to Verification
        </Button>
      </div>
    </div>
  );
}

export default function SchoolCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl p-6 text-center max-w-sm w-full">
            <p className="text-sm text-gray-600 mb-4">Verifying your school email...</p>
            <Button variant="secondary">Back to Verification</Button>
          </div>
        </div>
      }
    >
      <SchoolCallbackClient />
    </Suspense>
  );
}
