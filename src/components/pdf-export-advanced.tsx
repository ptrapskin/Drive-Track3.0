'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, FileText, Filter } from 'lucide-react';
import PDFExportComponent from '@/components/pdf-export';
import { Session, UserProfile } from '@/lib/types';

interface PDFExportWithFiltersProps {
  sessions: Session[];
  userProfile: UserProfile | null;
}

export const PDFExportWithFilters: React.FC<PDFExportWithFiltersProps> = ({
  sessions,
  userProfile
}) => {
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  } | undefined>();

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    minHours: '',
    weatherCondition: '',
    roadType: '',
  });

  // Filter sessions based on current filters
  const filteredSessions = React.useMemo(() => {
    let filtered = [...sessions];

    // Date range filter
    if (filters.startDate) {
      filtered = filtered.filter(session => 
        new Date(session.date) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(session => 
        new Date(session.date) <= new Date(filters.endDate)
      );
    }

    // Minimum hours filter
    if (filters.minHours) {
      const minSeconds = parseFloat(filters.minHours) * 3600;
      filtered = filtered.filter(session => session.duration >= minSeconds);
    }

    // Weather filter
    if (filters.weatherCondition) {
      filtered = filtered.filter(session => 
        session.weather === filters.weatherCondition
      );
    }

    // Road type filter
    if (filters.roadType) {
      filtered = filtered.filter(session => 
        session.roadTypes.includes(filters.roadType as any)
      );
    }

    return filtered;
  }, [sessions, filters]);

  // Update date range when filters change
  React.useEffect(() => {
    if (filters.startDate && filters.endDate) {
      setDateRange({
        start: filters.startDate,
        end: filters.endDate
      });
    } else {
      setDateRange(undefined);
    }
  }, [filters.startDate, filters.endDate]);

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      minHours: '',
      weatherCondition: '',
      roadType: '',
    });
    setDateRange(undefined);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get unique values for dropdowns
  const uniqueWeatherConditions = [...new Set(sessions.map(s => s.weather))];
  const uniqueRoadTypes = [...new Set(sessions.flatMap(s => s.roadTypes))];

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <CardTitle>Filter Driving Sessions</CardTitle>
          </div>
          <CardDescription>
            Filter your sessions before generating the PDF report
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>

          {/* Additional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="minHours">Minimum Hours</Label>
              <Input
                id="minHours"
                type="number"
                step="0.5"
                placeholder="e.g., 1.5"
                value={filters.minHours}
                onChange={(e) => handleFilterChange('minHours', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="weather">Weather Condition</Label>
              <select
                id="weather"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filters.weatherCondition}
                onChange={(e) => handleFilterChange('weatherCondition', e.target.value)}
              >
                <option value="">All Weather</option>
                {uniqueWeatherConditions.map(weather => (
                  <option key={weather} value={weather}>{weather}</option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="roadType">Road Type</Label>
              <select
                id="roadType"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filters.roadType}
                onChange={(e) => handleFilterChange('roadType', e.target.value)}
              >
                <option value="">All Road Types</option>
                {uniqueRoadTypes.map(roadType => (
                  <option key={roadType} value={roadType}>{roadType}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={clearFilters} 
              variant="outline" 
              size="sm"
              disabled={!Object.values(filters).some(Boolean)}
            >
              Clear Filters
            </Button>
            <div className="text-sm text-gray-600 flex items-center">
              Showing {filteredSessions.length} of {sessions.length} sessions
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PDF Export Component */}
      <PDFExportComponent
        sessions={filteredSessions}
        userProfile={userProfile}
        dateRange={dateRange}
      />

      {/* Quick Stats */}
      {filteredSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtered Sessions Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredSessions.length}
                </div>
                <div className="text-sm text-gray-600">Sessions</div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {(filteredSessions.reduce((acc, s) => acc + s.duration, 0) / 3600).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Total Hours</div>
              </div>
              
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {filteredSessions.reduce((acc, s) => acc + s.miles, 0).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Total Miles</div>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {(filteredSessions.filter(s => s.timeOfDay === 'Night')
                    .reduce((acc, s) => acc + s.duration, 0) / 3600).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Night Hours</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PDFExportWithFilters;
