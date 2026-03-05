"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { GraduationCap, IdCard } from "lucide-react";

export default function VerificationPage() {
  const router = useRouter();
  const { uid } = useAuthStore();
  const [schoolEmail, setSchoolEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code" | "done">("email");
  const [loading, setLoading] = useState(false);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;
    if (!schoolEmail.endsWith(".edu")) { toast.error("Please use a .edu email address"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/school-verify/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, schoolEmail }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to send code"); return; }
      toast.success("Verification code sent! Check your email.");
      setStep("code");
    } catch {
      toast.error("Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmCode(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;
    setLoading(true);
    try {
      const res = await fetch("/api/school-verify/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, code }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Invalid code"); return; }
      toast.success("School email verified!");
      setStep("done");
    } catch {
      toast.error("Failed to verify code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>←</Button>
        <h1 className="text-2xl font-black">Verification</h1>
      </div>

      <p className="text-gray-500 text-sm">
        Verify your identity to build trust with potential roommates.
      </p>

      {/* School Verification */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-6 h-6 text-roome-core" />
          <div>
            <h2 className="font-bold">School Verification</h2>
            <p className="text-sm text-gray-500">Verify with your .edu email</p>
          </div>
          {step === "done" && <Badge color="green" className="ml-auto">Verified ✓</Badge>}
        </div>

        {step === "email" && (
          <form onSubmit={handleSendCode} className="space-y-3">
            <Input
              type="email"
              placeholder="you@vanderbilt.edu"
              value={schoolEmail}
              onChange={(e) => setSchoolEmail(e.target.value)}
              label="School Email"
            />
            <Button type="submit" loading={loading} size="sm">Send Code</Button>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={handleConfirmCode} className="space-y-3">
            <p className="text-sm text-gray-500">Enter the 6-digit code sent to <strong>{schoolEmail}</strong></p>
            <Input
              type="text"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              label="Verification Code"
              maxLength={6}
            />
            <div className="flex gap-2">
              <Button type="submit" loading={loading} size="sm">Confirm</Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => setStep("email")}>Resend</Button>
            </div>
          </form>
        )}

        {step === "done" && (
          <p className="text-sm text-green-600 font-medium">Your school email has been verified.</p>
        )}
      </div>

      {/* ID Verification */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
        <div className="flex items-center gap-3">
          <IdCard className="w-6 h-6 text-roome-core" />
          <div>
            <h2 className="font-bold">ID Verification</h2>
            <p className="text-sm text-gray-500">Coming soon</p>
          </div>
          <Badge color="blue" className="ml-auto">Soon</Badge>
        </div>
      </div>
    </div>
  );
}
