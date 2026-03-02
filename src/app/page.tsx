"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

function RootPageClient() {
  useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { uid, loading, roommateUser } = useAuthStore();

  useEffect(() => {
    if (loading) return;
    const invite = searchParams.get("invite");
    if (!uid) {
      router.replace(invite ? `/signup?invite=${invite}` : "/login");
    } else if (roommateUser && !roommateUser.onboardingComplete) {
      router.replace("/onboarding");
    } else {
      router.replace("/home");
    }
  }, [uid, loading, roommateUser, router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

export default function RootPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <RootPageClient />
    </Suspense>
  );
}
