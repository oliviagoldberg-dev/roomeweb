"use client";
import { create } from "zustand";
import { User } from "@supabase/supabase-js";
import { RoommateUser } from "@/types/user";

interface AuthState {
  firebaseUser: User | null;
  roommateUser: RoommateUser | null;
  uid: string | null;
  loading: boolean;
  setFirebaseUser: (user: User | null) => void;
  setRoommateUser: (user: RoommateUser | null) => void;
  setLoading: (v: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  roommateUser: null,
  uid: null,
  loading: true,
  setFirebaseUser: (user) => set({ firebaseUser: user, uid: user?.id ?? null }),
  setRoommateUser: (user) => set({ roommateUser: user }),
  setLoading: (v) => set({ loading: v }),
  clear: () => set({ firebaseUser: null, roommateUser: null, uid: null }),
}));
