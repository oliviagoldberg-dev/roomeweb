"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { signIn } from "@/lib/firebase/auth";
import { getUser } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { RoommateUser } from "@/types/user";

export function LoginForm() {
  const router = useRouter();
  const { setFirebaseUser, setRoommateUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const fbUser = await signIn(email, password);
      setFirebaseUser(fbUser);
      const userData = await getUser(fbUser.id);
      setRoommateUser(userData as RoommateUser);
      if (userData && !(userData as RoommateUser).onboardingComplete) {
        router.push("/onboarding");
      } else {
        router.push("/home");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />
      <Button type="submit" loading={loading} className="w-full" size="lg">
        Sign In
      </Button>
      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-roome-core font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
