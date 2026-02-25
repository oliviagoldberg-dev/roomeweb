"use client";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";

interface PhotoSwiperProps {
  photos: string[];
  name: string;
  heightClassName?: string;
}

export function PhotoSwiper({ photos, name, heightClassName = "h-64" }: PhotoSwiperProps) {
  const [idx, setIdx] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    setTouchStart(e.touches[0].clientX);
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart === null) return;
    const delta = touchStart - e.changedTouches[0].clientX;
    if (delta > 40) setIdx((i) => Math.min(i + 1, photos.length - 1));
    if (delta < -40) setIdx((i) => Math.max(i - 1, 0));
    setTouchStart(null);
  }

  if (!photos.length) {
    return (
      <div className={`${heightClassName} bg-gradient-to-br from-roome-core to-roome-glow flex items-center justify-center`}>
        <Avatar src={null} name={name} size={100} />
      </div>
    );
  }

  return (
    <div
      className={`relative ${heightClassName} overflow-hidden select-none`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <img
        src={photos[idx]}
        alt={name}
        className="w-full h-full object-cover transition-opacity duration-200"
      />

      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />

      {photos.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === idx ? "bg-white w-5" : "bg-white/50 w-1.5"
              }`}
            />
          ))}
        </div>
      )}

      {idx > 0 && (
        <button
          className="absolute left-0 top-0 bottom-0 w-1/3"
          onClick={() => setIdx((i) => i - 1)}
        />
      )}
      {idx < photos.length - 1 && (
        <button
          className="absolute right-0 top-0 bottom-0 w-1/3"
          onClick={() => setIdx((i) => i + 1)}
        />
      )}
    </div>
  );
}
