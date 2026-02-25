"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUser } from "@/lib/firebase/firestore";
import { RoommateUser } from "@/types/user";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function UserProfilePage() {
  const { uid } = useParams<{ uid: string }>();
  const router = useRouter();
  const [user, setUser] = useState<RoommateUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser(uid).then((data) => {
      setUser(data as RoommateUser);
      setLoading(false);
    });
  }, [uid]);

  if (loading) return <div className="flex justify-center pt-20"><LoadingSpinner /></div>;
  if (!user) return <div className="p-8 text-center text-gray-400">User not found.</div>;

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">← Back</Button>
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="h-56 bg-roome-core/10 flex items-center justify-center">
          <Avatar src={user.profileImageURL} name={user.name} size={120} />
        </div>
        <div className="p-6 space-y-3">
          <h1 className="text-2xl font-black">{user.name}, {user.age}</h1>
          <p className="text-gray-500">{user.occupation}</p>
          {user.city && <Badge color="blue">{user.city}</Badge>}
          {user.bio && <p className="text-sm text-gray-700 mt-2">{user.bio}</p>}
          <div className="border-t pt-3 grid grid-cols-2 gap-2 text-sm">
            <Info label="School" value={user.school} />
            <Info label="Pet" value={user.hasPet ? "Has a pet" : "No pet"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
