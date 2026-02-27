"use client";
import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/Button";
import { CROP_VIEW_SIZE, CropState, cropImageToSquare } from "@/lib/utils/imageCrop";

interface PhotoCropModalProps {
  open: boolean;
  file: File | null;
  onCancel: () => void;
  onComplete: (file: File, previewUrl: string) => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function PhotoCropModal({ open, file, onCancel, onComplete }: PhotoCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => {
    if (!file) return;
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    const img = new Image();
    img.src = previewUrl;
    img.onload = () => setImgSize({ w: img.naturalWidth || img.width, h: img.naturalHeight || img.height });
    return () => { img.onload = null; };
  }, [file, previewUrl]);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const baseScale = imgSize.w && imgSize.h
    ? Math.max(CROP_VIEW_SIZE / imgSize.w, CROP_VIEW_SIZE / imgSize.h)
    : 1;
  const displayW = imgSize.w * baseScale;
  const displayH = imgSize.h * baseScale;
  const scaledW = displayW * zoom;
  const scaledH = displayH * zoom;
  const maxOffsetX = Math.max(0, (scaledW - CROP_VIEW_SIZE) / 2);
  const maxOffsetY = Math.max(0, (scaledH - CROP_VIEW_SIZE) / 2);
  const safeOffset = {
    x: clamp(offset.x, -maxOffsetX, maxOffsetX),
    y: clamp(offset.y, -maxOffsetY, maxOffsetY),
  };
  const zoomFill = `linear-gradient(to right, #38b6ff 0%, #38b6ff ${Math.round(((zoom - 1) / 2) * 100)}%, #D6ECFF ${Math.round(((zoom - 1) / 2) * 100)}%, #D6ECFF 100%)`;

  function onPointerDown(e: React.PointerEvent) {
    if (!file) return;
    setDragging(true);
    setStart({ x: e.clientX - safeOffset.x, y: e.clientY - safeOffset.y });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const next = { x: e.clientX - start.x, y: e.clientY - start.y };
    setOffset({
      x: clamp(next.x, -maxOffsetX, maxOffsetX),
      y: clamp(next.y, -maxOffsetY, maxOffsetY),
    });
  }

  function onPointerUp(e: React.PointerEvent) {
    setDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }

  async function handleSave() {
    if (!file) return;
    const crop: CropState = { zoom, offsetX: safeOffset.x, offsetY: safeOffset.y };
    const cropped = await cropImageToSquare(file, crop);
    const url = URL.createObjectURL(cropped);
    onComplete(cropped, url);
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Content className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-6 space-y-5">
          <Dialog.Title className="text-xl font-black text-center">Crop Photo</Dialog.Title>
          <div className="flex justify-center">
            <div
              className="relative rounded-2xl overflow-hidden bg-roome-pale"
              style={{ width: CROP_VIEW_SIZE, height: CROP_VIEW_SIZE, touchAction: "none", cursor: dragging ? "grabbing" : "grab" }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            >
              {file && (
                <img
                  src={previewUrl}
                  alt=""
                  draggable={false}
                  className="absolute left-1/2 top-1/2 select-none"
                  style={{
                    width: displayW || "100%",
                    height: displayH || "100%",
                    transform: `translate(-50%, -50%) translate(${safeOffset.x}px, ${safeOffset.y}px) scale(${zoom})`,
                    transformOrigin: "center",
                    touchAction: "none",
                  }}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                />
              )}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-3 rounded-2xl border-4 border-[#38b6ff]" />
                <div className="absolute inset-3 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-[#1f77ff]/80" />
                    <div className="border-r border-[#1f77ff]/80" />
                    <div />
                    <div className="border-r border-[#1f77ff]/80 border-t" />
                    <div className="border-r border-[#1f77ff]/80 border-t" />
                    <div className="border-t border-[#1f77ff]/80" />
                    <div className="border-r border-[#1f77ff]/80 border-t" />
                    <div className="border-r border-[#1f77ff]/80 border-t" />
                    <div className="border-t border-[#1f77ff]/80" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">Zoom</label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full rounded-full appearance-none h-2"
              style={{ background: zoomFill }}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave}>Use Photo</Button>
          </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
