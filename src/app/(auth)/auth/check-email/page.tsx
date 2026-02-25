import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function CheckEmailPage() {
  return (
    <div className="space-y-4 text-center">
      <h2 className="text-2xl font-black">Check your email</h2>
      <p className="text-sm text-gray-600">
        We sent a verification link. Click it to confirm your email, then you’ll be signed in automatically.
      </p>
      <div className="pt-2">
        <Button asChild size="lg" className="w-full">
          <Link href="/login">Back to Sign In</Link>
        </Button>
      </div>
    </div>
  );
}
