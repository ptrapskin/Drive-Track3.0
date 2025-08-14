"use client";

import Dashboard from '@/components/dashboard';
import DashboardHeader from '@/components/dashboard-header';
import type { Session, RoadType, WeatherCondition, TimeOfDay } from '@/lib/types';

// Mock session data for testing
const mockSessions: Session[] = [
  {
    id: '1',
    date: new Date().toISOString(),
    duration: 3600, // 1 hour in seconds
    miles: 15,
    weather: 'Sunny' as WeatherCondition,
    roadTypes: ['Residential', 'Highway'] as RoadType[],
    timeOfDay: 'Afternoon' as TimeOfDay,
  },
  {
    id: '2', 
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    duration: 2700, // 45 minutes in seconds
    miles: 8,
    weather: 'Rainy' as WeatherCondition,
    roadTypes: ['Residential'] as RoadType[],
    timeOfDay: 'Morning' as TimeOfDay,
  }
];

export default function TestDashboardPage() {
  const handleLogout = () => {
    console.log('Test logout clicked');
  };

  return (
    <main className="min-h-screen">
       <DashboardHeader 
        userEmail="test@example.com"
        onLogout={handleLogout}
        isViewingSharedAccount={false}
       />
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">Test Dashboard (No Auth Required)</h1>
        <Dashboard sessions={mockSessions} />
      </div>
    </main>
  );
}
