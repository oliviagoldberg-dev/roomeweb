import { ListingSnapshot } from "@/types/messages";
import { Badge } from "@/components/ui/Badge";
import { Home } from "lucide-react";
import { formatSourceLabel } from "@/lib/utils/formatSource";

interface ListingMessageCardProps {
  listing: ListingSnapshot;
  url: string;
  isMe: boolean;
}

export function ListingMessageCard({ listing, url, isMe }: ListingMessageCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block max-w-xs rounded-2xl overflow-hidden border transition-shadow hover:shadow-md ${
        isMe ? "border-white/20 bg-white/10" : "border-roome-pale bg-roome-pale/60"
      }`}
    >
      {listing.imageUrl && (
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="w-full h-32 object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}
      <div className="p-3 space-y-1">
        <div className="flex items-center gap-1.5">
          <Home className="w-3.5 h-3.5 text-roome-core" />
          <Badge color="blue" className="text-[10px]">{formatSourceLabel(listing.source)}</Badge>
        </div>
        <p className={`text-sm font-semibold line-clamp-2 ${isMe ? "text-white" : "text-gray-900"}`}>
          {listing.title}
        </p>
        {listing.description && (
          <p className={`text-xs line-clamp-2 ${isMe ? "text-white/70" : "text-gray-500"}`}>
            {listing.description}
          </p>
        )}
        <p className={`text-xs mt-1 ${isMe ? "text-white/60" : "text-roome-core"}`}>
          Open ↗
        </p>
      </div>
    </a>
  );
}
