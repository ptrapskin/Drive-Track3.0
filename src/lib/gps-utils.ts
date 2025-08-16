import { Geolocation } from '@capacitor/geolocation';

export interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  timestamp: number;
}

export interface GPSError {
  code: number;
  message: string;
  timestamp: number;
}

export class GPSTracker {
  private watchId: string | null = null;
  private lastPosition: GPSPosition | null = null;
  private errorCount = 0;
  private maxErrors = 5;
  private isTracking = false;

  async startTracking(
    onPosition: (position: GPSPosition) => void,
    onError: (error: GPSError) => void
  ): Promise<void> {
    if (this.isTracking) {
      console.warn('GPS tracking already active');
      return;
    }

    try {
      // Check permissions first
      const permissions = await this.checkAndRequestPermissions();
      if (!permissions) {
        throw new Error('GPS permissions denied');
      }

      this.isTracking = true;
      this.errorCount = 0;

      // Start with a single position to test GPS functionality
      try {
        const initialPosition = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        });

        if (initialPosition?.coords) {
          const gpsPosition = this.processPosition(initialPosition);
          if (gpsPosition) {
            onPosition(gpsPosition);
          }
        }
      } catch (error) {
        console.warn('Initial GPS position failed, continuing with watch:', error);
      }

      // Start continuous tracking
      this.watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000
        },
        (position, err) => {
          if (err) {
            this.handleError(err, onError);
            return;
          }

          if (position?.coords) {
            const gpsPosition = this.processPosition(position);
            if (gpsPosition) {
              this.errorCount = 0; // Reset error count on successful position
              onPosition(gpsPosition);
            }
          }
        }
      );

      console.log('GPS tracking started with watch ID:', this.watchId);
    } catch (error) {
      this.isTracking = false;
      throw error;
    }
  }

  async stopTracking(): Promise<void> {
    if (!this.isTracking) {
      return;
    }

    this.isTracking = false;

    if (this.watchId) {
      try {
        await Geolocation.clearWatch({ id: this.watchId });
        console.log('GPS watch cleared successfully');
      } catch (error) {
        console.error('Error clearing GPS watch:', error);
      }
      this.watchId = null;
    }

    this.lastPosition = null;
    this.errorCount = 0;
  }

  private async checkAndRequestPermissions(): Promise<boolean> {
    try {
      // Check current permissions
      const currentPermissions = await Geolocation.checkPermissions();
      
      if (currentPermissions.location === 'granted') {
        return true;
      }

      if (currentPermissions.location === 'denied') {
        throw new Error('Location access is permanently denied. Please enable in Settings > Privacy & Security > Location Services > Drive-Track.');
      }

      // Request permissions
      const permissions = await Geolocation.requestPermissions();
      return permissions.location === 'granted';
    } catch (error) {
      console.error('Permission check/request failed:', error);
      return false;
    }
  }

  private processPosition(position: any): GPSPosition | null {
    try {
      const { latitude, longitude, accuracy, speed } = position.coords;

      // Validate coordinates
      if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
        console.error('Invalid GPS coordinates:', { latitude, longitude });
        return null;
      }

      // Filter out positions with very poor accuracy (> 100 meters)
      if (accuracy && accuracy > 100) {
        console.warn('Poor GPS accuracy, ignoring:', accuracy);
        return null;
      }

      const gpsPosition: GPSPosition = {
        latitude,
        longitude,
        accuracy,
        speed: speed || 0,
        timestamp: Date.now()
      };

      // Store as last known position
      this.lastPosition = gpsPosition;
      
      return gpsPosition;
    } catch (error) {
      console.error('Error processing GPS position:', error);
      return null;
    }
  }

  private handleError(error: any, onError: (error: GPSError) => void): void {
    this.errorCount++;

    const gpsError: GPSError = {
      code: error.code || 0,
      message: error.message || 'Unknown GPS error',
      timestamp: Date.now()
    };

    console.error('GPS error:', gpsError);

    // Handle specific error types
    if (error.code === 3) { // TIMEOUT
      console.warn('GPS timeout occurred, waiting for next update...');
      // Don't call onError for timeouts unless we have too many consecutive errors
      if (this.errorCount < this.maxErrors) {
        return;
      }
    }

    // For critical errors or too many consecutive errors, notify the callback
    if (error.code === 1 || this.errorCount >= this.maxErrors) {
      onError(gpsError);
    }
  }

  getLastPosition(): GPSPosition | null {
    return this.lastPosition;
  }

  isActivelyTracking(): boolean {
    return this.isTracking;
  }
}

// Utility function to get user-friendly error messages
export function getGPSErrorMessage(error: GPSError): string {
  switch (error.code) {
    case 1:
      return 'Location access denied. Please enable location services for Drive-Track in Settings.';
    case 2:
      return 'Unable to determine location. Please ensure GPS is enabled and try moving to an area with better signal.';
    case 3:
      return 'GPS is taking longer than expected. Please ensure you have a clear view of the sky and try again.';
    default:
      return 'GPS tracking error occurred. Please try again.';
  }
}
