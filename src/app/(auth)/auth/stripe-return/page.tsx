"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

function StripeReturn() {
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

export default function StripeReturnPage() {
  return (
    <Suspense>
      <StripeReturn />
    </Suspense>
  );
}
