"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function RootPage() {
  useAuth();
  const router = useRouter();
  const { uid, loading, roommateUser } = useAuthStore();

  useEffect(() => {
    if (loading) return;
    if (!uid) {
      router.replace("/login");
    } else if (roommateUser && !roommateUser.onboardingComplete) {
      router.replace("/onboarding");
    } else {
      router.replace("/home");
    }
  }, [uid, loading, roommateUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
