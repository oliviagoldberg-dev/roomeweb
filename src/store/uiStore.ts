"use client";
import { create } from "zustand";
import { BrowseFilters, DEFAULT_FILTERS } from "@/types/filters";
import { RoommateUser } from "@/types/user";

interface UiState {
  filters: BrowseFilters;
  setFilters: (f: Partial<BrowseFilters>) => void;
  resetFilters: () => void;

  undoStack: RoommateUser[];
  pushUndo: (user: RoommateUser) => void;
  popUndo: () => RoommateUser | undefined;

  addListingModalOpen: boolean;
  setAddListingModalOpen: (v: boolean) => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  filters: DEFAULT_FILTERS,
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  undoStack: [],
  pushUndo: (user) => set((s) => ({ undoStack: [...s.undoStack, user] })),
  popUndo: () => {
    const stack = get().undoStack;
    if (!stack.length) return undefined;
    const user = stack[stack.length - 1];
    set({ undoStack: stack.slice(0, -1) });
    return user;
  },

  addListingModalOpen: false,
  setAddListingModalOpen: (v) => set({ addListingModalOpen: v }),
}));
