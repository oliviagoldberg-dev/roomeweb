"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useUiStore } from "@/store/uiStore";
import { SLEEP_SCHEDULE_OPTIONS } from "@/lib/utils/constants";
import { Button } from "@/components/ui/Button";

interface FiltersDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function FiltersDrawer({ open, onClose }: FiltersDrawerProps) {
  const { filters, setFilters, resetFilters } = useUiStore();

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <Dialog.Content className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 shadow-2xl overflow-y-auto">
          <div className="p-6 border-b flex items-center justify-between">
            <Dialog.Title className="text-xl font-bold">Filters</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-700 text-lg">✕</button>
            </Dialog.Close>
          </div>

          <div className="p-6 space-y-6">
            {/* Budget */}
            <div className="space-y-2">
              <p className="font-semibold">Budget</p>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>${filters.budgetMin}</span>
                <span>–</span>
                <span>${filters.budgetMax}</span>
              </div>
              <label className="text-xs text-gray-400">Min</label>
              <input type="range" min={0} max={10000} step={50}
                value={filters.budgetMin}
                onChange={(e) => setFilters({ budgetMin: Number(e.target.value) })}
                className="w-full rounded-full"
                style={{ background: sliderFill(filters.budgetMin, 0, 10000) }}
              />
              <label className="text-xs text-gray-400">Max</label>
              <input type="range" min={0} max={10000} step={50}
                value={filters.budgetMax}
                onChange={(e) => setFilters({ budgetMax: Number(e.target.value) })}
                className="w-full rounded-full"
                style={{ background: sliderFill(filters.budgetMax, 0, 10000) }}
              />
            </div>

            {/* Has pet */}
            <div className="space-y-2">
              <p className="font-semibold">Pets</p>
              <div className="flex gap-2">
                {([null, true, false] as const).map((v) => (
                  <button
                    key={String(v)}
                    onClick={() => setFilters({ hasPet: v })}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                      filters.hasPet === v
                        ? "bg-roome-core text-white"
                        : "bg-roome-pale text-roome-deep"
                    }`}
                  >
                    {v === null ? "Any" : v ? "Has pet" : "No pet"}
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep schedule */}
            <div className="space-y-2">
              <p className="font-semibold">Sleep Schedule</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setFilters({ sleepSchedule: null })}
                  className={`px-3 py-2 rounded-xl text-sm font-medium text-left transition-colors ${
                    !filters.sleepSchedule ? "bg-roome-core text-white" : "bg-roome-pale text-roome-deep"
                  }`}
                >
                  Any
                </button>
                {SLEEP_SCHEDULE_OPTIONS.map((o) => (
                  <button
                    key={o}
                    onClick={() => setFilters({ sleepSchedule: o })}
                    className={`px-3 py-2 rounded-xl text-sm font-medium text-left transition-colors ${
                      filters.sleepSchedule === o ? "bg-roome-core text-white" : "bg-roome-pale text-roome-deep"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-t flex gap-3">
            <Button variant="secondary" onClick={resetFilters} className="flex-1">Reset</Button>
            <Button onClick={onClose} className="flex-1">Apply</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function sliderFill(value: number, min: number, max: number) {
  const pct = Math.round(((value - min) / (max - min)) * 100);
  return `linear-gradient(to right, #38b6ff 0%, #38b6ff ${pct}%, #D6ECFF ${pct}%, #D6ECFF 100%)`;
}
