"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { getUser } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { RoommateUser } from "@/types/user";
import type { EmailOtpType } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setFirebaseUser, setRoommateUser } = useAuthStore();
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    async function handleCallback() {
      let user = null;

      try {
        const code = searchParams.get("code");
        const tokenHash = searchParams.get("token_hash");
        const type = searchParams.get("type") as EmailOtpType | null;

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
          throw new Error("Missing callback params");
        }
      } catch {
        setMessage("Email verification failed. Please try signing in again.");
        return;
      }

      setFirebaseUser(user);
      if (user) {
        const userData = await getUser(user.id);
        setRoommateUser(userData as RoommateUser | null);
        if (userData && !(userData as RoommateUser).onboardingComplete) {
          router.replace("/onboarding");
          return;
        }
      }
      router.replace("/home");
    }

    void handleCallback();
  }, [router, searchParams, setFirebaseUser, setRoommateUser]);

  return (
    <div className="space-y-4 text-center">
      <LoadingSpinner />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4 text-center">
        <LoadingSpinner />
        <p className="text-sm text-gray-600">Confirming your email...</p>
      </div>
    }>
      <AuthCallbackClient />
    </Suspense>
  );
}
