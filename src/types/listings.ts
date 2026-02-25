export interface SavedListing {
  id: string;
  ownerUid: string;
  url: string;
  title: string;
  imageUrl: string;
  description: string;
  source: string;   // "Zillow" | "Apartments.com" | "Manual" | hostname
  city?: string;
  neighborhood?: string;
  // Extended listing details
  rent?: number;
  utilities?: number;
  beds?: string;
  baths?: string;
  leaseLength?: string;
  amenities?: string[];
  moveInDate?: string;
  photoURLs?: string[];
  notes?: string;
  createdAt?: string;
  folderId?: string | null;
}

export interface LinkPreviewResult {
  title: string;
  imageUrl: string;
  description: string;
  source: string;
  rent?: number;
}
