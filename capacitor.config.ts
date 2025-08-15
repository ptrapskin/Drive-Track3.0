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
    },
    Filesystem: {
      iosUseDocumentsDirectory: true,
    },
    Share: {
      enableFileSharing: true,
    },
  },
};

export default config;
