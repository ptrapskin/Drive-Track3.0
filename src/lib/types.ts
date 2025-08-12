

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
  name?: string | null;
  email: string | null;
  dateOfBirth?: string | null;
  permitDate?: string | null;
  totalHoursGoal?: number | null;
  nightHoursGoal?: number | null;
}

export interface Skill {
  id: number;
  title: string;
  teachingPoints: string[];
  completed: boolean;
}

export interface Share {
    studentUid: string;
    studentEmail: string;
    studentName: string;
}

export interface GuardianInvite {
    students: { [uid: string]: { name: string, email: string } };
}
