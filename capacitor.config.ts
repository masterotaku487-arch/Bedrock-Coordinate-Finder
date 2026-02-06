import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.masterotaku.bedrockfinder',
  appName: 'Bedrock Finder',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a2e",
      showSpinner: true,
      spinnerColor: "#10b981"
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: "#1a1a2e"
    }
  }
};

export default config;
