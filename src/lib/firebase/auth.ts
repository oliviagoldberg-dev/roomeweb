"use client";
import { supabase } from "@/lib/supabase/client";

export async function signUp(email: string, password: string, name = "") {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  const user = data.user;
  if (!user) throw new Error("Failed to create user");

  const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");

  await supabase.from("profiles").upsert({
    id: user.id,
    uid: user.id,
    email,
    name,
    username,
    phone: "",
    age: "",
    occupation: "",
    company: "",
    companyIndustry: "",
    school: "",
    university: "",
    hometown: "",
    city: "",
    moveCity: "",
    neighborhood: "",
    neighborhoodPreferences: [],
    bio: "",
    budgetMin: 0,
    budgetMax: 0,
    beds: "",
    baths: "",
    leaseLength: "",
    furnished: false,
    hasAC: false,
    hasLaundry: false,
    hasParking: false,
    hasPet: false,
    smokes: false,
    host: false,
    cleanliness: 3,
    sleepSchedule: "",
    workFromHome: "",
    connections: [],
    likedBy: [],
    photoURLs: [],
    profileImageURL: "",
    onboardingComplete: false,
  });

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

export function onAuthChanged(callback: (user: { id: string } | null) => void) {
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => sub.subscription.unsubscribe();
}
