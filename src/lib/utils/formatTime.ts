import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";

export function formatMessageTime(date: Date): string {
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEE");
}

export function formatRelative(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}
