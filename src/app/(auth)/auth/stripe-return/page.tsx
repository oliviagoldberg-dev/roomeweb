"use client";
export const dynamic = "force-dynamic";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function StripeReturnPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("success") === "true") {
      toast.success("Welcome to Premium! Your account has been upgraded.");
    } else if (params.get("canceled") === "true") {
      toast("Upgrade canceled. You can upgrade anytime from your profile.");
    }
    router.replace("/profile");
  }, [params, router]);

  return null;
}
