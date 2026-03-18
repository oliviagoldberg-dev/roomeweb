"use client";
import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { RoommateUser } from "@/types/user";
import { PawPrint, X, Heart } from "lucide-react";

interface SwipeCardProps {
  user: RoommateUser;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onClick: () => void;
  index: number; // 0 = top card
}

const SWIPE_THRESHOLD = 100;

export function SwipeCard({ user, onSwipeLeft, onSwipeRight, onClick, index }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, -20], [1, 0]);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(0);

  async function flyOut(direction: "left" | "right") {
    await animate(x, direction === "right" ? 600 : -600, { duration: 0.35 });
    if (direction === "right") onSwipeRight();
    else onSwipeLeft();
  }

  const scale = index === 0 ? 1 : index === 1 ? 0.95 : 0.9;
  const yOffset = index === 0 ? 0 : index === 1 ? 10 : 20;

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{
        x: index === 0 ? x : 0,
        rotate: index === 0 ? rotate : 0,
        scale,
        y: yOffset,
        zIndex: 10 - index,
      }}
      drag={index === 0 ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={() => { setDragging(true); dragStart.current = Date.now(); }}
      onDragEnd={(_, info) => {
        setDragging(false);
        if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
          flyOut(info.offset.x > 0 ? "right" : "left");
        } else {
          animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
        }
      }}
      onClick={() => {
        if (!dragging && Date.now() - dragStart.current < 200) onClick();
      }}
    >
      <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden h-full select-none">
        {/* Like / Nope overlays */}
        {index === 0 && (
          <>
            <motion.div
              className="absolute top-6 left-6 z-10 border-4 border-green-400 rounded-xl px-3 py-1 rotate-[-15deg]"
              style={{ opacity: likeOpacity }}
            >
              <span className="text-green-400 font-black text-2xl tracking-widest">LIKE</span>
            </motion.div>
            <motion.div
              className="absolute top-6 right-6 z-10 border-4 border-red-400 rounded-xl px-3 py-1 rotate-[15deg]"
              style={{ opacity: nopeOpacity }}
            >
              <span className="text-red-400 font-black text-2xl tracking-widest">NOPE</span>
            </motion.div>
          </>
        )}

        {/* Photo */}
        <div className="h-64 bg-roome-core/10 flex items-center justify-center">
          {user.profileImageURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.profileImageURL} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <Avatar src={null} name={user.name} size={96} />
          )}
        </div>

        {/* Info */}
        <div className="p-5 space-y-3">
          <div>
            <p className="text-xl font-black text-gray-900">{user.name}{user.age ? `, ${user.age}` : ""}</p>
            {user.occupation && <p className="text-sm text-gray-500">{user.occupation}</p>}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {user.city && <Badge color="blue">{user.city}</Badge>}
            {user.hasPet && (
              <Badge color="teal" className="inline-flex items-center gap-1">
                <PawPrint className="w-3.5 h-3.5" />
                Has a pet
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {index === 0 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); flyOut("left"); }}
            className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-red-400 hover:scale-110 transition-transform"
          >
            <X className="w-7 h-7" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); flyOut("right"); }}
            className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-green-400 hover:scale-110 transition-transform"
          >
            <Heart className="w-7 h-7" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
