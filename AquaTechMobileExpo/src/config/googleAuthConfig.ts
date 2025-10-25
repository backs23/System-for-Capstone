// Google Sign-In client IDs for Expo AuthSession.
// Fill these with your OAuth 2.0 Client IDs from Google Cloud (linked to your Firebase project):
// - expoClientId: Use the Web client ID for Expo Go (recommended in dev)
// - androidClientId: Your Android OAuth client ID (optional for production builds)
// - iosClientId: Your iOS OAuth client ID (optional for production builds)
// - webClientId: If you test on web
// NOTE: Do NOT commit sensitive client secrets. Client IDs are public identifiers.

export const GOOGLE_OAUTH = {
  androidClientId: '81111367204-5g6m51lgp02p4plgugf2cibsbmeoshbu.apps.googleusercontent.com',
  webClientId: '81111367204-3lugs1ac578hnuaodtkdtk0b6bs366bc.apps.googleusercontent.com', // Web client ID for React Native Firebase
  iosClientId: '', // Add iOS client ID when needed
} as const;
