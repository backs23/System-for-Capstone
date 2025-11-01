# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is the AquaTech capstone project - a comprehensive IoT aquaculture monitoring system with multiple components:
- **Flask Web Application**: Python-based web dashboard for water monitoring
- **React Native Mobile App**: Cross-platform mobile application for remote monitoring
- **Firebase Integration**: Real-time database and authentication backend

## Development Commands

### Python Flask Web Application
```powershell
# Install Python dependencies
python -m pip install -r requirements.txt

# Run the Flask development server
python app.py
# Alternative: Use the start script
python start_app.py

# Access the web application
# http://127.0.0.1:5000
```

### React Native Mobile App
```powershell
# Navigate to mobile app directory
cd AquaTechMobileExpo

# Install dependencies and sync package-lock.json
npm install

# Start development server
npm run start
# Or use Expo CLI directly
npx expo start

# Build for Android
npm run android
# Build for iOS
npm run ios

# Run on web
npm run web
```

### EAS Build (Expo Application Services)
```powershell
# Build for production
eas build --platform android
eas build --platform ios
eas build --platform all

# Submit to app stores
eas submit --platform android
eas submit --platform ios
```

**Important**: Always run `npm install` before EAS builds to ensure package-lock.json is synchronized. The build system requires exact dependency matching.

## High-Level Architecture

### System Components

**1. Flask Backend (Root Directory)**
- `app.py`: Main Flask application with route handlers and authentication
- `database.py`: Firebase integration layer with data models and database operations  
- `firebase_config.py`: Firebase configuration and authentication management
- `templates/`: Jinja2 HTML templates for web interface
- Authentication supports both email/password and Google OAuth

**2. React Native Mobile App (`AquaTechMobileExpo/`)**
- `App.tsx`: Main application entry point with navigation setup
- `src/components/`: Reusable UI components
- `src/screens/`: Screen components for different app sections
- `src/navigation/`: Navigation configuration and routing
- `src/services/`: API communication and data services
- `src/config/`: App configuration including Firebase setup

### Data Flow Architecture

**Authentication Flow:**
1. Mobile app authenticates via Firebase Auth (email/password or Google)
2. Flask backend verifies Firebase ID tokens via Admin SDK
3. User data synchronized between Firebase Auth and Firestore collections
4. Session management handled differently per platform (mobile: Firebase, web: Flask sessions)

**Sensor Data Pipeline:**
1. IoT sensors → ThingSpeak API → Firebase Firestore
2. Real-time data served via Flask API endpoints (`/api/sensor-data`)
3. Mobile app polls data via HTTP requests to Flask backend
4. Web dashboard displays live charts using Chart.js

**Database Collections (Firestore):**
- `users`: User profiles and authentication data
- `sensor_data`: Historical sensor readings with timestamps
- `alerts`: System notifications and warnings
- `user_activity`: Audit logs for user actions

### Key Integration Points

**Firebase Configuration:**
- Shared Firebase project between web and mobile
- Service account key for Flask backend admin operations
- Web config JSON for client-side Firebase initialization
- Consistent user ID mapping between Auth and Firestore

**Cross-Platform Authentication:**
- Mobile: Firebase Auth SDK with Google Sign-In integration
- Web: Server-side token verification with session management
- API endpoints for mobile auth synchronization (`/api/auth/sync`, `/api/auth/login`, `/api/auth/signup`)

**Development Environment:**
- Flask serves as API backend for both web dashboard and mobile app
- CORS headers configured for cross-origin requests
- Fallback data generation when Firebase is unavailable
- Environment-based configuration (development vs production)

## Common Issues & Solutions

**EAS Build Problems:**
- Dependency version conflicts between React Native and Firebase
- Run `npm install` to sync package-lock.json before any EAS build
- Firebase/AsyncStorage peer dependency warnings are normal and non-blocking

**Firebase Setup:**
- Requires both service account key (backend) and web config (frontend)
- Template file `firebase-web-config.json.template` provided for web config
- See `FIREBASE_SETUP.md` for detailed configuration steps

**Development Database:**
- Firebase connection is required for full functionality
- Fallback mode generates mock data when Firebase is unavailable
- Sample data automatically initialized on first Firebase connection

## File Structure Reference

```
System-for-Capstone/
├── app.py                          # Flask main application
├── database.py                     # Firebase database layer
├── firebase_config.py              # Firebase setup and admin operations
├── requirements.txt                # Python dependencies
├── templates/                      # Web application templates
├── AquaTechMobileExpo/            # React Native mobile app
│   ├── App.tsx                    # Mobile app entry point
│   ├── package.json               # Node.js dependencies
│   ├── src/
│   │   ├── components/            # Reusable mobile components
│   │   ├── screens/               # Mobile app screens
│   │   ├── navigation/            # Mobile app routing
│   │   ├── services/              # API and data services
│   │   └── config/                # Mobile app configuration
│   └── google-services.json       # Android Firebase config
└── README.md                      # Project documentation
```

This architecture enables real-time aquaculture monitoring across web and mobile platforms with Firebase providing the scalable backend infrastructure.