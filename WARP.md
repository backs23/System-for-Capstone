# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**TilapiaSync** (internally called AquaTechMobileExpo) is a React Native mobile application built with Expo for monitoring tilapia aquaculture water quality. The app provides real-time sensor monitoring, Firebase authentication, and integrates with a Flask backend API for sensor data retrieval.

**Tech Stack:**
- React Native 0.81.4 with Expo SDK 54
- TypeScript with strict mode enabled
- Firebase Realtime Database & Authentication
- React Navigation (Stack + Bottom Tabs)
- React Native Firebase native modules
- Flask backend (separate from this repo) for sensor data API

## Common Development Commands

### Starting the App
```bash
# Start Expo development server
npm start

# Run on Android emulator/device
npm run android

# Run on iOS simulator/device (macOS only)
npm run ios

# Run in web browser
npm run web
```

### Building with EAS
```bash
# Development build (APK, internal distribution)
eas build --profile development --platform android

# Preview build (APK, internal distribution)
eas build --profile preview --platform android

# Production build (AAB for Google Play)
eas build --profile production --platform android
```

### Python Environment (for backend testing)
A `.venv` Python virtual environment exists in this directory, likely for local backend development/testing:
```bash
# Activate virtual environment
.\.venv\Scripts\Activate.ps1  # PowerShell
# or
.venv\Scripts\activate.bat     # CMD
```

## Architecture

### Navigation Structure
The app uses a root stack navigator with three main routes:
- **Loading**: Initial splash/loading screen (`TankLoadingScreen`)
- **Auth**: Authentication stack containing Login, Signup, and ForgotPassword screens
- **MainTabs**: Bottom tab navigator with 4 tabs after authentication:
  - Dashboard: Overview metrics, charts, alerts, activity logs
  - Monitor: Real-time water quality sensor readings (connects to Firebase Realtime Database)
  - Contact: Contact/support information
  - Home: User guide

Navigation reference is centralized in `src/navigation/navigationRef.ts` for programmatic navigation outside of React components.

### Firebase Integration
- **Authentication**: Email/password and Google Sign-In
- **Realtime Database**: Live sensor data at path `/tilapiaTank`
- Configuration files:
  - `google-services.json` (Android)
  - `GoogleService-Info.plist` (iOS)
  - `src/config/firebase.ts` (fallback config)

**Security Notes:**
- Firebase credentials are committed in `firebase.ts` (not best practice for production)
- Service account JSON files (`firebase-service-account.txt`) should remain in `.gitignore`
- See `FIREBASE_SETUP.md` for Firebase project setup instructions

### API Configuration
All backend API settings centralized in `src/config/apiConfig.ts`:
- `BASE_URL`: Flask backend URL (default: `http://192.168.100.6:5000`)
- `USE_MOCKS`: Toggle between real API calls and mock data for development
- `ENDPOINTS`: Named endpoints for auth, sensors, alerts, controls
- `THINGSPEAK`: Optional ThingSpeak IoT platform integration

**For physical device testing:** Update `BASE_URL` to your computer's LAN IP address (not `localhost` or `127.0.0.1`), e.g., `http://192.168.1.100:5000`.

### Key Services
- **`src/services/apiService.ts`**: Singleton service for all HTTP requests to Flask backend
  - Handles authentication tokens via AsyncStorage
  - Request timeouts configured (10s default)
  - Mock data generators for offline development
- **`src/utils/auth.ts`**: Centralized logout function (clears Firebase auth + Google Sign-In + AsyncStorage)
- **`src/utils/network.ts`**: Network connectivity utilities

### Sensor Data Flow
1. **Water Monitoring Screen** subscribes to Firebase Realtime Database (`/tilapiaTank`)
2. Real-time updates push to component state and historical chart data (last 20 points)
3. Expected sensor fields: `temperature`, `turbidity`, `ammonia`, `lastUpdated`
4. Falls back to mock data if Firebase unavailable (Expo Go compatibility)

### Styling
Centralized in `src/styles/commonStyles.ts`:
- Color palette with primary cyan theme (`#0891b2`)
- Typography scales, spacing constants, border radius, shadows
- Common component styles for consistency

## Development Notes

### Native Builds Required
This app uses React Native Firebase native modules and requires:
- **Development builds** with `expo-dev-client` (cannot use Expo Go)
- Proper Android/iOS native folders (currently gitignored, regenerated on build)

### Android Configuration
- Package: `com.monitoring.tilapiasync`
- Keystore files: `@zkenia44__AquaTechMobileExpo.jks` (never commit)
- Uses cleartext traffic for local development (see `expo-build-properties` plugin in `app.json`)
- Edge-to-edge display enabled, predictive back gesture disabled

### EAS Project
- Project ID: `591e6dbd-758d-4021-94eb-4d441122c104`
- Owner: `zkenia44`
- CLI version required: `>= 3.0.0`

### Authentication Flows
- **Email/Password**: Handled by Firebase Auth + optional Flask backend validation
- **Google Sign-In**: Uses `@react-native-google-signin/google-signin` with web client ID from `googleAuthConfig.ts`
- **Guest Mode**: AsyncStorage key `guest_user` tracked for guest sessions
- **Logout**: Clears Firebase session, revokes Google access, removes local tokens, navigates to Auth screen

## File Structure Highlights
```
src/
├── components/       # Reusable UI components (HeaderLogoutButton, TilapiaLogo)
├── config/          # Firebase, API, Google auth configuration
├── navigation/      # App navigator and navigation utilities
├── screens/         # All screen components (Dashboard, Login, Monitor, etc.)
├── services/        # API service layer
├── styles/          # Centralized style definitions
└── utils/           # Auth, network, and other utilities
```

## Common Tasks

### Adding a New Screen
1. Create screen component in `src/screens/`
2. Import and add to navigator in `src/navigation/AppNavigator.tsx`
3. Use centralized styles from `src/styles/commonStyles.ts`

### Connecting to New Backend Endpoint
1. Add endpoint path to `API_CONFIG.ENDPOINTS` in `src/config/apiConfig.ts`
2. Add method to `apiService` class in `src/services/apiService.ts`
3. Use TypeScript interfaces for request/response types

### Testing with Mock Data
Set `USE_MOCKS: true` in `src/config/apiConfig.ts` to use simulated API responses without a backend server.

### Debugging Sensor Data
1. Check Firebase Realtime Database path `/tilapiaTank` in Firebase Console
2. Verify `SENSOR_DB_PATH` constant in `WaterMonitoringScreen.tsx`
3. Monitor console logs for Firebase connection warnings
4. Set `USE_MOCK_HISTORY: true` in `WaterMonitoringScreen.tsx` for immediate graph visualization

### Updating Firebase Configuration
1. Download new `google-services.json` / `GoogleService-Info.plist` from Firebase Console
2. Place in project root
3. Update `src/config/firebase.ts` if web config changed
4. Rebuild native app (`eas build` or `npm run android`)
