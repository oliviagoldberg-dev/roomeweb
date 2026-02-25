import { cn } from "@/lib/utils/cn";

type Color = "blue" | "green" | "red" | "purple" | "teal" | "gray";

const colorClasses: Record<Color, string> = {
  blue:   "bg-roome-core text-white",
  green:  "bg-roome-verify/30 text-green-700",
  red:    "bg-roome-match/10 text-roome-match",
  purple: "bg-roome-msg/20 text-purple-700",
  teal:   "bg-roome-friend/20 text-teal-700",
  gray:   "bg-roome-offwhite text-gray-600",
};

interface BadgeProps {
  children: React.ReactNode;
  color?: Color;
  className?: string;
}

export function Badge({ children, color = "blue", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        colorClasses[color],
        className
      )}
    >
      {children}
    </span>
  );
}
