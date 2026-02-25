"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { updateUser } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { GraduationCap, IdCard } from "lucide-react";

export default function VerificationPage() {
  const router = useRouter();
  const { uid } = useAuthStore();
  const [schoolEmail, setSchoolEmail] = useState("");
  const [schoolVerified, setSchoolVerified] = useState(false);
  const [saving, setSaving] = useState(false);

  async function verifySchoolEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;
    if (!schoolEmail.endsWith(".edu")) {
      toast.error("Please use a .edu email address");
      return;
    }
    setSaving(true);
    try {
      await updateUser(uid, { schoolEmail, schoolVerified: true });
      setSchoolVerified(true);
      toast.success("School email verified! ✓");
    } catch {
      toast.error("Failed to verify email");
    } finally {
      setSaving(false);
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
          {schoolVerified && <Badge color="green" className="ml-auto">Verified ✓</Badge>}
        </div>
        {!schoolVerified && (
          <form onSubmit={verifySchoolEmail} className="space-y-3">
            <Input
              type="email"
              placeholder="you@vanderbilt.edu"
              value={schoolEmail}
              onChange={(e) => setSchoolEmail(e.target.value)}
              label="School Email"
            />
            <Button type="submit" loading={saving} size="sm">
              Verify
            </Button>
          </form>
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
          <Badge color="gray" className="ml-auto">Soon</Badge>
        </div>
      </div>
    </div>
  );
}
