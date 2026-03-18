"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { TopNav } from "@/components/layout/TopNav";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useAuth();
  const router = useRouter();
  const { uid, loading, roommateUser } = useAuthStore();

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
      <TopNav />
      <main className="flex-1 overflow-y-auto pb-14">
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex items-center justify-center gap-8 py-3">
        <a href="https://instagram.com/theroomeofficial" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-[#38b6ff]/40 hover:text-[#38b6ff] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
        </a>
        <a href="https://tiktok.com/@theroomeofficial" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-[#38b6ff]/40 hover:text-[#38b6ff] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
          </svg>
        </a>
        <a href="https://www.facebook.com/profile.php?id=61580724520501" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-[#38b6ff]/40 hover:text-[#38b6ff] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
          </svg>
        </a>
      </nav>
    </div>
  );
}
