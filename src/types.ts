export type TravelType = string; // extended to support all travel type keys

export interface TripInput {
  destination: string;
  budget: number;
  days: number;
  travelTypes: string[];
  travelType?: string; // legacy compat for old saved trips
  persons: number;
  ageGroup?: string;
  cuisines?: string[];
  accommodation?: string;
  avoid?: string[];
  departureCity?: string;
  departureDate?: string;
  returnDate?: string;
}

export interface DayActivity {
  activity: string;
  description: string;
  cost: number;
  tip: string;
}

export interface DayLunch {
  restaurant: string;
  description: string;
  cost: number;
  tip: string;
}

export interface DayPlan {
  day: number;
  title: string;
  morning: DayActivity;
  lunch: DayLunch;
  evening: DayActivity;
}

export interface HotelEmpfehlung {
  name: string;
  beschreibung: string;
  preis_pro_nacht: number;
  tipp: string;
}

export interface BudgetBreakdown {
  hotel: number;
  essen: number;
  aktivitaeten: number;
  transport: number;
}

export interface TripPlan {
  destination: string;
  country: string;
  budget_breakdown: BudgetBreakdown;
  geheimtipps: string[];
  days: DayPlan[];
  hotel_empfehlung: HotelEmpfehlung;
  transport_tipps: string[];
  beste_reisezeit: string;
  warnung: string;
}

export interface SavedTrip {
  id: string;
  input: TripInput;
  plan: TripPlan;
  savedAt: string;
}

export interface TripRating {
  id: string;
  tripId: string;
  destination: string;
  rating: number;
  liked: string;
  improved: string;
  ratedAt: string;
}

export interface PackingItem {
  item: string;
  quantity: number;
  essential: boolean;
  packed: boolean;
}

export interface PackingCategory {
  name: string;
  items: PackingItem[];
}

export type Screen =
  | 'welcome'
  | 'input'
  | 'loading'
  | 'plan'
  | 'saved'
  | 'rating'
  | 'packing'
  | 'guide'
  | 'entdecken'
  | 'translator'
  | 'quiz'
  | 'tools'
  | 'visa'
  | 'notfall'
  | 'kultur'
  | 'ar';
