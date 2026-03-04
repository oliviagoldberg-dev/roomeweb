"use client";
import { useAuthStore } from "@/store/authStore";

export function useSubscription() {
  const { roommateUser } = useAuthStore();
  const tier = roommateUser?.subscriptionTier ?? "free";
  return {
    isPremium: tier === "premium",
    canConnect: tier === "premium" || (roommateUser?.connectionsCount ?? 0) < 10,
    connectionsUsed: roommateUser?.connectionsCount ?? 0,
  };
}
