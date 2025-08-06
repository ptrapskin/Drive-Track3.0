import type { Session } from './types';

export const initialSessions: Session[] = [
  {
    id: '1',
    date: new Date('2024-07-20T14:00:00Z').toISOString(),
    duration: 3600, // 1 hour
    miles: 45,
    weather: 'Sunny',
    roadTypes: ['Arterial', 'Highway'],
    isNight: false,
  },
  {
    id: '2',
    date: new Date('2024-07-21T21:00:00Z').toISOString(),
    duration: 1800, // 30 minutes
    miles: 15,
    weather: 'Cloudy',
    roadTypes: ['Residential', 'Arterial'],
    isNight: true,
  },
  {
    id: '3',
    date: new Date('2024-07-22T09:30:00Z').toISOString(),
    duration: 5400, // 1.5 hours
    miles: 60,
    weather: 'Rainy',
    roadTypes: ['Highway'],
    isNight: false,
  },
  {
    id: '4',
    date: new Date('2024-07-19T18:00:00Z').toISOString(),
    duration: 2700,
    miles: 22,
    weather: 'Sunny',
    roadTypes: ['Residential'],
    isNight: false,
  }
];
