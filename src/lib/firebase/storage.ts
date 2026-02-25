"use client";
import { supabase } from "@/lib/supabase/client";

const BUCKET = "roomr";

async function uploadToBucket(path: string, file: File) {
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadOnboardingPhotos(uid: string, files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const path = `users/${uid}/photo_${i}.jpg`;
    urls.push(await uploadToBucket(path, files[i]));
  }
  return urls;
}

export async function uploadProfilePhotos(uid: string, files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const path = `profilePhotos/${uid}/photo_${i}.jpg`;
    urls.push(await uploadToBucket(path, files[i]));
  }
  return urls;
}

export async function uploadListingPhotos(uid: string, files: File[]): Promise<string[]> {
  const ts = Date.now();
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const path = `listings/${uid}/${ts}_${i}.jpg`;
    urls.push(await uploadToBucket(path, files[i]));
  }
  return urls;
}
