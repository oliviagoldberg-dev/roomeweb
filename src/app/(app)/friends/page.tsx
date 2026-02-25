import { FriendsList } from "@/components/friends/FriendsList";

export default function FriendsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-black mb-6">Friends</h1>
      <FriendsList />
    </div>
  );
}
