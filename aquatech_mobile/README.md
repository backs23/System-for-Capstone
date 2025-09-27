# AquaTech Mobile (Flutter)

This Flutter app is a full mobile rebuild of your AquaTech website. It uses:
- Firebase Authentication (email/password and Google Sign-In)
- Cloud Firestore for sensor data (collections: sensor_data, alerts)
- Material 3 UI with charts (fl_chart)

## Prerequisites
- Windows (pwsh) with Flutter 3.35+ and Dart 3.9+
- Android SDK / Emulator
- Firebase project (Auth + Firestore enabled)
- Windows Developer Mode enabled (required for plugin symlinks)

Enable Developer Mode:
- Press Win+R, run: start ms-settings:developers
- Toggle "Developer Mode" to On

## Setup
1) Install dependencies
   cd aquatech_mobile
   flutter pub get

2) Configure Firebase (generates lib/firebase_options.dart)
   flutter pub global activate flutterfire_cli
   flutterfire configure --project <your-firebase-project>

   Notes:
   - Select Android (and iOS if you’ll build on a Mac later)
   - Use your desired package ID (e.g., com.aquatech.mobile)
   - After this, rebuild iOS/Android folders if you changed the package ID

3) Android config
- Set applicationId in android/app/build.gradle.kts (default is com.example.aquatech_mobile)
- Ensure minSdk = 23 (already set)
- Add SHA-1/256 fingerprints in Firebase Console if using Google Sign-In

4) Run
   flutter run -d <deviceId>

## Collections expected in Firestore
- sensor_data: { timestamp: timestamp, temperature: number, dissolved_oxygen: number, ammonia: number, ... }
- alerts: { timestamp: timestamp, type: 'warning'|'info'|'success', message: string, ... }

The app currently reads:
- Latest reading: sensor_data ordered by timestamp desc limit 1 (stream)
- Historical: last 12/24 hours by timestamp range

## Roadmap (next steps)
- Build Support and Contact screens (mirroring templates)
- Style polish to match Tailwind look and navigation
- Alerts list and quick actions
- App icon and splash (flutter_launcher_icons, flutter_native_splash)
- Optional: Deep links and external intents
- Optional: Offline caching

## Troubleshooting
- If you see "Building with plugins requires symlink support":
  Enable Developer Mode on Windows and restart your terminal.
- If Firebase init fails at startup:
  Ensure lib/firebase_options.dart exists (created by flutterfire configure).
- Google Sign-In on Android requires app SHA fingerprints configured in Firebase Console.
