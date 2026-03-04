"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Sparkles } from "lucide-react";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  feature: "connections" | "messages";
}

export function PaywallModal({ open, onClose, feature }: PaywallModalProps) {
  const { uid } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const headline =
    feature === "connections"
      ? "You've reached your 10 free likes"
      : "Free messaging limit reached";
  const body =
    feature === "connections"
      ? "Upgrade to Premium for unlimited likes and connections."
      : "Upgrade to Premium for unlimited messaging.";

  async function handleUpgrade() {
    if (!uid) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Content className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-sm bg-white rounded-3xl shadow-2xl z-50 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-roome-core/10 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-roome-core" />
            </div>
          </div>
          <Dialog.Title className="text-xl font-black mb-2">{headline}</Dialog.Title>
          <Dialog.Description className="text-sm text-gray-500 mb-6">{body}</Dialog.Description>
          <div className="space-y-3">
            <Button className="w-full" onClick={handleUpgrade} loading={loading}>
              Go Premium — $9.99/mo
            </Button>
            <button onClick={onClose} className="w-full text-sm text-gray-400 hover:text-gray-600 py-1">
              Maybe later
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
