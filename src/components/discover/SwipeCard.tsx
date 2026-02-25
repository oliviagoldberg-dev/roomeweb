"use client";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { RoommateUser } from "@/types/user";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { PawPrint } from "lucide-react";

interface SwipeCardProps {
  user: RoommateUser;
  onLike: () => void;
  onPass: () => void;
  isTop: boolean;
}

export function SwipeCard({ user, onLike, onPass, isTop }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, -20], [1, 0]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > 100) { onLike(); }
    else if (info.offset.x < -100) { onPass(); }
  }

  return (
    <motion.div
      style={{ x, rotate, position: "absolute", width: "100%", cursor: isTop ? "grab" : "default" }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: "grabbing" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden select-none">
        <div className="relative h-72 bg-roome-core/10 flex items-center justify-center">
          {user.profileImageURL
            ? <img src={user.profileImageURL} alt={user.name} className="w-full h-full object-cover" />
            : <Avatar src={null} name={user.name} size={120} />
          }
          {/* Like / pass overlays */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-6 left-6 border-4 border-green-400 rounded-xl px-4 py-2 rotate-[-15deg]"
          >
            <span className="text-green-400 font-black text-2xl">LIKE</span>
          </motion.div>
          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute top-6 right-6 border-4 border-red-400 rounded-xl px-4 py-2 rotate-[15deg]"
          >
            <span className="text-red-400 font-black text-2xl">PASS</span>
          </motion.div>
        </div>
        <div className="p-5 space-y-2">
          <h3 className="text-xl font-black">{user.name}{user.age ? `, ${user.age}` : ""}</h3>
          {user.occupation && <p className="text-gray-500 text-sm">{user.occupation}</p>}
          {user.bio && <p className="text-sm text-gray-700 line-clamp-2">{user.bio}</p>}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {user.city && <Badge color="blue">{user.city}</Badge>}
            {user.budgetMax > 0 && <Badge color="green">${user.budgetMin}–${user.budgetMax}/mo</Badge>}
            {user.hasPet && (
              <Badge color="teal" className="inline-flex items-center gap-1">
                <PawPrint className="w-3.5 h-3.5" />
                Has a pet
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
