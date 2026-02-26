"use client";

export const CROP_VIEW_SIZE = 280;
export const CROP_OUTPUT_SIZE = 1024;

export interface CropState {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function cropImageToSquare(file: File, crop: CropState, viewSize = CROP_VIEW_SIZE, outputSize = CROP_OUTPUT_SIZE) {
  const img = await loadImageFromFile(file);
  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;

  const baseScale = Math.max(viewSize / imgW, viewSize / imgH);
  const zoom = Math.max(1, crop.zoom || 1);
  const displayW = imgW * baseScale * zoom;
  const displayH = imgH * baseScale * zoom;

  const maxOffsetX = Math.max(0, (displayW - viewSize) / 2);
  const maxOffsetY = Math.max(0, (displayH - viewSize) / 2);

  const offsetX = clamp(crop.offsetX, -maxOffsetX, maxOffsetX);
  const offsetY = clamp(crop.offsetY, -maxOffsetY, maxOffsetY);

  const imgLeft = (viewSize - displayW) / 2 + offsetX;
  const imgTop = (viewSize - displayH) / 2 + offsetY;

  const srcX = clamp(-imgLeft / (baseScale * zoom), 0, imgW);
  const srcY = clamp(-imgTop / (baseScale * zoom), 0, imgH);
  const srcSize = Math.min(imgW - srcX, imgH - srcY, viewSize / (baseScale * zoom));

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to create canvas context");
  ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, outputSize, outputSize);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed to crop image"))), "image/jpeg", 0.92);
  });

  const fileName = file.name.replace(/\.\w+$/, "") + ".jpg";
  return new File([blob], fileName, { type: "image/jpeg" });
}
