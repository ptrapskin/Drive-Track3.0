
export type RoadType = "Residential" | "Arterial" | "Highway";
export type WeatherCondition = "Sunny" | "Cloudy" | "Rainy" | "Snowy";
export type TimeOfDay = "Morning" | "Afternoon" | "Evening" | "Night";

export interface Session {
  id: string;
  date: string; // ISO string
  duration: number; // in seconds
  miles: number;
  weather: WeatherCondition;
  roadTypes: RoadType[];
  timeOfDay: TimeOfDay;
}

export interface User {
  uid: string;
  email: string | null;
}

export interface UserProfile {
  id?: string;
  email: string | null;
  dateOfBirth?: string;
  permitDate?: string;
  totalHoursGoal?: number;
  nightHoursGoal?: number;
}

export interface Skill {
  id: number;
  title: string;
  teachingPoints: string[];
  completed: boolean;
}

export interface Share {
  id: string;
  studentUid: string;
  studentEmail: string;
  guardianEmail: string;
}
