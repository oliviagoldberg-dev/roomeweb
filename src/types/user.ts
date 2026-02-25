export interface RoommateUser {
  id: string;
  uid: string;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  age?: string;
  occupation?: string;   // job title
  company?: string;
  companyIndustry?: string;
  school?: string;
  university?: string;
  city?: string;         // current city
  moveCity?: string;     // target city to move to
  hometown?: string;
  neighborhood?: string; // preferred neighborhood
  neighborhoodPreferences?: string[];
  bio: string;
  // Home requirements
  budgetMin: number;
  budgetMax: number;
  beds?: string;         // "Studio" | "1" | "2" | "3+"
  baths?: string;        // "1" | "1.5" | "2" | "2+"
  leaseLength?: string;
  furnished?: boolean;
  hasAC?: boolean;
  hasLaundry?: boolean;
  hasParking?: boolean;
  moveInDate?: string;
  // Lifestyle
  hasPet: boolean;
  smokes?: boolean;
  host?: boolean;
  cleanliness?: number;
  sleepSchedule?: string;
  workFromHome?: string;
  preferredTemp?: string;
  // App fields
  profileImageURL: string;
  photoURLs: string[];
  connections: string[];
  likedBy: string[];
  onboardingComplete: boolean;
  inviteCode?: string;
  createdAt?: string;
}

export type RoommateUserPartial = Partial<RoommateUser> & { id: string };
