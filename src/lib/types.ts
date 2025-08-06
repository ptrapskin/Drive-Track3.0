export type RoadType = "Residential" | "Arterial" | "Highway";
export type WeatherCondition = "Sunny" | "Cloudy" | "Rainy" | "Snowy";

export interface Session {
  id: string;
  date: string; // ISO string
  duration: number; // in seconds
  miles: number;
  weather: WeatherCondition;
  roadTypes: RoadType[];
  isNight: boolean;
}

export interface User {
  uid: string;
  email: string | null;
}
