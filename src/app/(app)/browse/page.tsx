"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBrowseUsers } from "@/hooks/useBrowseUsers";
import { useFriendsInCity } from "@/hooks/useFriendsInCity";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { RoommateCard } from "@/components/browse/RoommateCard";
import { FiltersDrawer } from "@/components/browse/FiltersDrawer";
import { UserDetailModal } from "@/components/browse/UserDetailModal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import { RoommateUser } from "@/types/user";
import { Search, SlidersHorizontal } from "lucide-react";

export default function BrowsePage() {
  const router = useRouter();
  const { users, loading } = useBrowseUsers();
  const { friends: friendsInCity } = useFriendsInCity();
  const { roommateUser } = useAuthStore();
  const { filters } = useUiStore();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<RoommateUser | null>(null);

  const filtered = users.filter((u) => {
    if (u.budgetMax < filters.budgetMin) return false;
    if (u.budgetMin > filters.budgetMax) return false;
    if (filters.hasPet !== null && u.hasPet !== filters.hasPet) return false;
    if (filters.cleanliness !== null && u.cleanliness !== filters.cleanliness) return false;
    if (filters.sleepSchedule && u.sleepSchedule !== filters.sleepSchedule) return false;
    return true;
  });

  const friendIds = new Set(friendsInCity.map((f) => f.id));
  const others = filtered.filter((u) => !friendIds.has(u.id));

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">Browse Roommates</h1>
        <Button
          size="sm"
          onClick={() => setFiltersOpen(true)}
          className="inline-flex items-center gap-2 bg-[#38b6ff] hover:bg-[#2ea6f0] text-white"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {!roommateUser?.moveCity && !roommateUser?.city && (
        <div className="bg-white rounded-2xl p-4 text-sm text-gray-600 mb-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3">
          <span>Complete your profile to browse roommates in your city.</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/profile/edit")}
            className="inline-flex items-center justify-center"
          >
            Complete Profile
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center pt-20"><LoadingSpinner /></div>
      ) : (
        <div className="space-y-8">
          {friendsInCity.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">
                Friends in your city
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {friendsInCity.map((u) => (
                  <RoommateCard key={u.id} user={u} onClick={() => setSelected(u)} />
                ))}
              </div>
            </section>
          )}

          {others.length > 0 ? (
            <section>
              {friendsInCity.length > 0 && (
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">
                  Everyone
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {others.map((u) => (
                  <RoommateCard key={u.id} user={u} onClick={() => setSelected(u)} />
                ))}
              </div>
            </section>
          ) : friendsInCity.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Search className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="font-semibold">No roommates found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : null}
        </div>
      )}

      <FiltersDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} />
      {selected && (
        <UserDetailModal user={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
