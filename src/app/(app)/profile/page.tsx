"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/firebase/auth";
import { useAuthStore } from "@/store/authStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSubscription } from "@/hooks/useSubscription";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function ProfilePage() {
  const router = useRouter();
  const { uid, clear } = useAuthStore();
  const { user, loading } = useCurrentUser();
  const { isPremium } = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);

  async function handleManageSubscription() {
    if (!uid) return;
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setPortalLoading(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    clear();
    router.push("/login");
  }

  if (loading) return <div className="flex justify-center pt-20"><LoadingSpinner /></div>;
  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-sm p-6">
        <div className="flex items-center gap-4">
          <Avatar src={user.profileImageURL} name={user.name} size={80} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">{user.name}</h1>
              {isPremium
                ? <span className="text-xs font-bold bg-roome-core text-white rounded-full px-2 py-0.5">Premium ✦</span>
                : <span className="text-xs font-semibold bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">Free</span>
              }
            </div>
            <p className="text-gray-500">@{user.username}</p>
            {user.occupation && <p className="text-sm text-gray-600 mt-1">{user.occupation}</p>}
            {user.city && <Badge color="blue" className="mt-2">{user.city}</Badge>}
          </div>
        </div>
        {user.bio && <p className="text-sm text-gray-700 mt-4">{user.bio}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Friends" value={user.connections?.length ?? 0} color="text-roome-core" />
        <StatCard label="Budget Min" value={`$${user.budgetMin}`} color="text-roome-core" />
        <StatCard label="Budget Max" value={`$${user.budgetMax}`} color="text-roome-core" />
      </div>

      {/* Details */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
        <h2 className="font-bold">Details</h2>
        <DetailRow label="Full Name" value={user.name ?? ""} />
        <DetailRow label="Username" value={user.username ? `@${user.username}` : ""} />
        <DetailRow label="Email" value={user.email ?? ""} />
        <DetailRow label="Phone" value={user.phone ?? ""} />
        <DetailRow label="Age" value={user.age ?? ""} />
        <DetailRow label="Job" value={user.occupation ?? ""} />
        <DetailRow label="Company" value={user.company ?? ""} />
        <DetailRow label="College / University" value={user.university ?? ""} />
        <DetailRow label="Hometown" value={user.hometown ?? ""} />
        <DetailRow label="City" value={user.city ?? ""} />
        <DetailRow label="Move In Date" value={user.moveInDate ?? ""} />
        <DetailRow
          label="Neighborhoods"
          value={formatList(user.neighborhoodPreferences, user.neighborhood)}
        />
        <DetailRow label="Budget Range" value={formatBudgetRange(user.budgetMin, user.budgetMax)} />
        <DetailRow label="Beds" value={user.beds ?? ""} />
        <DetailRow label="Baths" value={user.baths ?? ""} />
        <DetailRow label="Lease Length" value={user.leaseLength ?? ""} />
        <DetailRow label="Furnished" value={formatBool(user.furnished)} />
        <DetailRow label="AC" value={formatBool(user.hasAC)} />
        <DetailRow label="Laundry" value={formatBool(user.hasLaundry)} />
        <DetailRow label="Parking" value={formatBool(user.hasParking)} />
        <DetailRow label="Sleep Schedule" value={user.sleepSchedule ?? ""} />
        <DetailRow label="Work from home" value={user.workFromHome ?? ""} />
        <DetailRow label="Pet" value={user.hasPet ? "Has a pet" : ""} />
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <Link href="/profile/edit" className="block">
          <Button variant="secondary" className="w-full">Edit Profile</Button>
        </Link>
        <Link href="/profile/verification" className="block">
          <Button variant="secondary" className="w-full">Verification</Button>
        </Link>
        {isPremium ? (
          <Button variant="secondary" className="w-full" onClick={handleManageSubscription} loading={portalLoading}>
            Manage Subscription
          </Button>
        ) : (
          <Link href="/pricing" className="block">
            <Button className="w-full">Upgrade to Premium ✦</Button>
          </Link>
        )}
        <Button variant="danger" onClick={handleSignOut} className="w-full">
          Found your roommate
        </Button>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
      <p className={`text-xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
      <span className="text-roome-black">{label}</span>
      <span className="text-right max-w-[60%] truncate text-roome-core">{value}</span>
    </div>
  );
}

function formatBool(v?: boolean) {
  if (v === undefined) return "";
  return v ? "Yes" : "No";
}

function formatBudgetRange(min?: number, max?: number) {
  if (!min && !max) return "";
  const minText = min ? `$${min.toLocaleString()}` : "";
  const maxText = max ? `$${max.toLocaleString()}` : "";
  if (minText && maxText) return `${minText} – ${maxText} / mo`;
  return `${minText || maxText} / mo`;
}

function formatList(list?: string[] | null, fallback?: string) {
  if (list && list.length > 0) return list.join(", ");
  return fallback ?? "";
}
