import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.drivetrack.app',
  appName: 'Drive-Track',
  webDir: 'out',
  server: {
    allowNavigation: [
      'https://identitytoolkit.googleapis.com',
      'https://www.googleapis.com',
      'https://securetoken.googleapis.com',
      'https://drive-track-7027f.firebaseapp.com'
    ]
  },
  plugins: {
    StatusBar: {
      style: 'light',
      backgroundColor: '#ffffff',
      overlaysWebView: false,
    },
    SafeArea: {
      enabled: true,
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
      webClientId: '94983186341-2l6q8pvubmvqohaln0kftft7ucir6rtm.apps.googleusercontent.com',
    },
    Filesystem: {
      iosUseDocumentsDirectory: true,
    },
    Share: {
      enableFileSharing: true,
    },
    Browser: {
      presentationStyle: 'popover',
    },
    Geolocation: {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    },
  },
};

export default config;
