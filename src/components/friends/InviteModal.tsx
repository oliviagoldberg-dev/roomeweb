"use client";
import { useState } from "react";
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
  const appUrl = "https://roomeofficial.com";
  const inviteLink = `${appUrl}/?invite=${code}`;
  const shareText = `Hi!! Join me on ROOMe, the website for finding roommates. Use my invite code ${code} to sign up! ${inviteLink}`;
  const shareBody = shareText;
  const [sharing, setSharing] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(shareBody);
    toast.success("Invite link copied!");
  }

  function sendText() {
    if (typeof window === "undefined") return;
    const body = encodeURIComponent(shareBody);
    window.location.href = `sms:?body=${body}`;
  }

  async function handleShare() {
    if (sharing) return;
    setSharing(true);
    try {
      await navigator.share({ text: shareBody });
    } catch (err: any) {
      // AbortError = user dismissed the share sheet, not a real error
      if (err?.name !== "AbortError") {
        toast.error("Could not share. Try copying instead.");
      }
    } finally {
      setSharing(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed inset-x-4 top-1/4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-sm bg-white rounded-3xl shadow-2xl z-50 p-8 space-y-6 text-center">
          <Dialog.Title className="text-2xl font-black">Invite Friends</Dialog.Title>
          <p className="text-gray-500 text-sm">
            Share your invite code and get connected when they sign up.
          </p>
          {code ? (
            <div className="bg-roome-core/20 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-1">Your Invite Code</p>
              <p className="text-4xl font-black text-gray-900 tracking-widest font-mono">{code}</p>
            </div>
          ) : (
            <div className="h-20 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-roome-glow/30 border-t-roome-glow rounded-full animate-spin" />
            </div>
          )}
          <div className="space-y-3">
            {typeof navigator !== "undefined" && "share" in navigator ? (
              <Button
                className="w-full flex items-center justify-center gap-2"
                loading={sharing}
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                Share Invite
              </Button>
            ) : (
              <Button className="w-full flex items-center justify-center gap-2" onClick={sendText}>
                <Share2 className="w-4 h-4" />
                Send Text
              </Button>
            )}
            <Button variant="secondary" className="w-full flex items-center justify-center gap-2" onClick={copyCode}>
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
