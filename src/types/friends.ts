export interface FriendUser {
  id: string;
  name: string;
  username: string;
  occupation: string;
  profileImageURL?: string;
}

export interface FriendRequest {
  id: string;
  fromUID: string;
  toUID: string;
  name: string;
  username: string;
  profileImageURL?: string;
  status: "pending" | "accepted" | "declined";
  timestamp?: string;
}

export interface UserSearchResult {
  id: string;
  uid: string;
  username: string;
  name: string;
  profileImageURL?: string;
}
