"use client";
import toast from "react-hot-toast";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/Button";
import { Copy, Share2 } from "lucide-react";

interface InviteModalProps {
  open: boolean;
  code: string;
  onClose: () => void;
}

export function InviteModal({ open, code, onClose }: InviteModalProps) {
  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://roomeweb-prod3.vercel.app";
  const inviteLink = `${appUrl}/signup?invite=${code}`;
  const shareText = `Join me on ROOMe — the app for finding roommates. Use my invite code ${code} to sign up!`;
  const shareBody = `${shareText}\n${inviteLink}`;

  function copyCode() {
    navigator.clipboard.writeText(shareBody);
    toast.success("Invite link copied!");
  }

  function sendText() {
    if (typeof window === "undefined") return;
    const body = encodeURIComponent(shareBody);
    window.location.href = `sms:?&body=${body}`;
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed inset-x-4 top-1/4 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-sm bg-white rounded-3xl shadow-2xl z-50 p-8 space-y-6 text-center">
          <Dialog.Title className="text-2xl font-black">Invite Friends</Dialog.Title>
          <p className="text-gray-500 text-sm">
            Share your invite code and get connected when they sign up.
          </p>
          {code ? (
            <div className="bg-roome-pale rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-1">Your Invite Code</p>
              <p className="text-4xl font-black text-roome-deep tracking-widest font-mono">{code}</p>
            </div>
          ) : (
            <div className="h-20 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-roome-glow/30 border-t-roome-glow rounded-full animate-spin" />
            </div>
          )}
          <div className="space-y-3">
            {typeof navigator !== "undefined" && navigator.share ? (
              <Button
                className="w-full"
                onClick={() => navigator.share({ text: shareText, url: inviteLink })}
              >
                <Share2 className="w-4 h-4" />
                Share Invite
              </Button>
            ) : (
              <Button className="w-full" onClick={sendText}>
                <Share2 className="w-4 h-4" />
                Send Text
              </Button>
            )}
            <Button variant="secondary" className="w-full" onClick={copyCode}>
              <Copy className="w-4 h-4" />
              Copy Invite Message
            </Button>
            <Button variant="ghost" className="w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
