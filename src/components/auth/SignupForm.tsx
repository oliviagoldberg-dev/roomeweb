"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { signUp } from "@/lib/firebase/auth";
import { redeemInviteCode } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setFirebaseUser } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const invite = searchParams.get("invite");
    if (invite) {
      setInviteCode(invite.toUpperCase());
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }

    const trimmedCode = inviteCode.trim().toUpperCase();

    setLoading(true);
    try {
      const { user: fbUser, session } = await signUp(email, password, name);

      if (trimmedCode) {
        const ok = await redeemInviteCode(trimmedCode, fbUser.id);
        if (ok) {
          toast.success("Invite code applied! You're connected with your friend.");
        } else {
          toast.error("Invite code not found — you can add friends later.");
        }
      }

      if (session) {
        // Email confirmation is off — session is ready, go straight to onboarding
        setFirebaseUser(fbUser);
        router.push("/onboarding");
      } else {
        // Email confirmation required — ask them to check their inbox
        setFirebaseUser(null);
        router.push("/auth/check-email");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign up failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        type="text"
        placeholder="Jane Smith"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoComplete="name"
      />
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
        placeholder="At least 6 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="new-password"
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-600">
          Invite Code <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. ABC123"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="w-full px-4 py-3 rounded-2xl bg-roome-offwhite text-roome-black placeholder-gray-400 border border-transparent focus:outline-none focus:ring-2 focus:ring-roome-core/40 font-mono tracking-widest uppercase transition"
          />
        </div>
      </div>

      <Button type="submit" loading={loading} className="w-full" size="lg">
        Create Account
      </Button>
      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-roome-core font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
