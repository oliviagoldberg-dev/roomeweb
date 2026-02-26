"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { signUp } from "@/lib/firebase/auth";
import { validateInviteCode, redeemInviteCode } from "@/lib/firebase/firestore";
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
  const [codeStatus, setCodeStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const invite = searchParams.get("invite");
    if (invite) {
      setInviteCode(invite.toUpperCase());
      setCodeStatus("idle");
    }
  }, [searchParams]);

  async function handleCodeBlur() {
    const trimmed = inviteCode.trim().toUpperCase();
    if (!trimmed) { setCodeStatus("idle"); return; }
    const inviterUid = await validateInviteCode(trimmed);
    setCodeStatus(inviterUid ? "valid" : "invalid");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }

    const trimmedCode = inviteCode.trim().toUpperCase();
    if (trimmedCode) {
      const inviterUid = await validateInviteCode(trimmedCode);
      if (!inviterUid) { toast.error("Invalid invite code"); return; }
    }

    setLoading(true);
    try {
      const fbUser = await signUp(email, password, name);

      if (trimmedCode) {
        await redeemInviteCode(trimmedCode, fbUser.id);
        toast.success("Invite code applied! You're connected with your friend.");
      }

      setFirebaseUser(null);
      router.push("/auth/check-email");
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
            onChange={(e) => { setInviteCode(e.target.value.toUpperCase()); setCodeStatus("idle"); }}
            onBlur={handleCodeBlur}
            maxLength={6}
            className="w-full px-4 py-3 rounded-2xl bg-roome-offwhite text-roome-black placeholder-gray-400 border border-transparent focus:outline-none focus:ring-2 focus:ring-roome-core/40 font-mono tracking-widest uppercase transition"
          />
          {codeStatus === "valid" && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-lg">✓</span>
          )}
          {codeStatus === "invalid" && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-lg">✗</span>
          )}
        </div>
        {codeStatus === "valid" && (
          <p className="text-xs text-green-600">Valid invite code — you'll be connected as friends!</p>
        )}
        {codeStatus === "invalid" && (
          <p className="text-xs text-red-500">Code not found. Check with your friend and try again.</p>
        )}
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
