"use client";
interface ActionButtonsProps {
  onPass: () => void;
  onLike: () => void;
  onUndo?: () => void;
  canUndo: boolean;
}

export function ActionButtons({ onPass, onLike, onUndo, canUndo }: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-6 mt-8">
      <button
        onClick={onPass}
        className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform border border-red-100"
      >
        ✕
      </button>
      {onUndo && (
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-gray-400 disabled:opacity-30 hover:scale-110 transition-transform"
        >
          ↩
        </button>
      )}
      <button
        onClick={onLike}
        className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform border border-green-100"
      >
        ❤️
      </button>
    </div>
  );
}
