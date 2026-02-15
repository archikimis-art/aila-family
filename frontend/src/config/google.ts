// Google OAuth Configuration
// Note: You need to create a project in Google Cloud Console
// and enable Google Sign-In API

// Web Client ID - get this from Google Cloud Console
// https://console.cloud.google.com/apis/credentials
export const GOOGLE_WEB_CLIENT_ID = '1000000000000-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com';

// For Expo, we use the expo-auth-session proxy
export const GOOGLE_AUTH_CONFIG = {
  expoClientId: GOOGLE_WEB_CLIENT_ID,
  webClientId: GOOGLE_WEB_CLIENT_ID,
  // androidClientId: 'YOUR_ANDROID_CLIENT_ID', // For native Android
  // iosClientId: 'YOUR_IOS_CLIENT_ID', // For native iOS
};
