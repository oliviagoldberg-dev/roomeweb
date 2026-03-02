"use client";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export async function signUp(email: string, password: string, name = "") {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const emailRedirectTo = siteUrl ? `${siteUrl}/auth/callback` : undefined;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: emailRedirectTo ? { emailRedirectTo } : undefined,
  });
  if (error) throw error;
  const user = data.user;
  if (!user) throw new Error("Failed to create user");

  // Profile is created after email verification via ensureProfile in useAuth.
  // Attempting to upsert here fails because the user has no session yet
  // (email not yet confirmed), so auth.uid() is null and RLS blocks the insert.

  return user;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function changePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export function onAuthChanged(callback: (user: User | null) => void) {
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => sub.subscription.unsubscribe();
}
