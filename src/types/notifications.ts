export type NotificationType = "match" | "friend_request" | "friend_accepted" | "message" | "system";

export interface AppNotification {
  id: string;
  toUID: string;
  fromUID?: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt?: string;
}
