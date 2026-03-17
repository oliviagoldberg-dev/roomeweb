export interface ListingSnapshot {
  title: string;
  imageUrl: string;
  description: string;
  source: string;
}

export interface Message {
  id: string;
  senderUID: string;
  text: string;
  isLink: boolean;
  listing?: ListingSnapshot;
  createdAt?: string;
}

export interface Conversation {
  id: string;         // convoId = [uid1,uid2].sort().join("_")
  participants: string[];
  lastMessage: string;
  lastMessageTime?: string;
  unreadCount: Record<string, number>;
  // resolved fields
  otherUserUid?: string;
  otherUserName?: string;
  otherUserPhoto?: string;
  isLiked?: boolean;  // true if current user liked this person from browse
}
