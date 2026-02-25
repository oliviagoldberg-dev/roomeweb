import { ConvoList } from "@/components/messages/ConvoList";

export default function MessagesPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-black mb-4">Messages</h1>
      <ConvoList />
    </div>
  );
}
