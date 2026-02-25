"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useAuth();
  const router = useRouter();
  const { uid, loading, roommateUser } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!uid) { router.replace("/login"); return; }
    if (roommateUser && !roommateUser.onboardingComplete) {
      router.replace("/onboarding");
    }
  }, [uid, loading, roommateUser, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!uid) return null;

  return (
    <div className="flex flex-col h-screen bg-roome-offwhite overflow-hidden">
      <TopNav onMenuToggle={() => setSidebarOpen((o) => !o)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
