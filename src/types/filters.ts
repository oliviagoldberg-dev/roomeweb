export interface BrowseFilters {
  budgetMin: number;
  budgetMax: number;
  hasPet: boolean | null;
  cleanliness: number | null;
  sleepSchedule: string | null;
  moveInDate: string | null;
}

export const DEFAULT_FILTERS: BrowseFilters = {
  budgetMin: 0,
  budgetMax: 10000,
  hasPet: null,
  cleanliness: null,
  sleepSchedule: null,
  moveInDate: null,
};
