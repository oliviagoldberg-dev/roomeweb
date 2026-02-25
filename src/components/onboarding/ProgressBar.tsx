interface ProgressBarProps {
  step: number;
  total: number;
  label: string;
  onSkip?: () => void;
}

export function ProgressBar({ step, total, label, onSkip }: ProgressBarProps) {
  const pct = ((step) / (total - 1)) * 100;
  return (
    <div className="px-6 pt-6 pb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-800">{label}</span>
        {onSkip && (
          <button onClick={onSkip} className="text-sm text-gray-400 hover:text-gray-600">
            Skip
          </button>
        )}
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full">
        <div
          className="h-1.5 bg-roome-core rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
