export interface ListingFolder {
  id: string;
  ownerUid: string;
  name: string;
  createdAt?: string;
}

export interface FolderShare {
  id: string;
  folderId: string;
  ownerUid: string;
  sharedWithUid: string;
  createdAt?: string;
}
