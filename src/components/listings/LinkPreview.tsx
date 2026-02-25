import { Badge } from "@/components/ui/Badge";
import { LinkPreviewResult } from "@/types/listings";
import { formatSourceLabel } from "@/lib/utils/formatSource";

interface LinkPreviewProps {
  preview: LinkPreviewResult;
  url: string;
}

export function LinkPreview({ preview, url }: LinkPreviewProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
    >
      {preview.imageUrl && (
        <img
          src={preview.imageUrl}
          alt={preview.title}
          className="w-full h-40 object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}
      <div className="p-4 space-y-1">
        <Badge color="blue" className="text-[11px] mb-1">{formatSourceLabel(preview.source)}</Badge>
        <p className="font-semibold text-gray-900 line-clamp-2">{preview.title}</p>
        {preview.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{preview.description}</p>
        )}
      </div>
    </a>
  );
}
