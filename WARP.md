# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project: AquaTech – Flask web app with Firebase-backed data and offline fallbacks.

- Primary language/tooling: Python 3.x, Flask
- Key modules: app.py, database.py, firebase_config.py, start_app.py
- Key assets: templates/*.html, static/css/*.css

Common commands (PowerShell)

- Install dependencies
  - python -m pip install -r requirements.txt

- Run the app (development)
  - Preferred: python start_app.py
  - Alternative: python app.py
  - App serves on http://127.0.0.1:5000

- Firebase setup essentials (see FIREBASE_SETUP.md for full steps)
  - Place firebase-service-account.json at the repo root.
  - Create firebase-web-config.json at the repo root (use firebase-web-config.json.template as a starter).
  - Enable Email/Password and Google providers in Firebase Console.

Notes on tests and linting

- No test suite or lint configuration found in this repository at the time of writing.

High-level architecture

- Web layer (Flask: app.py)
  - Initializes Flask with CSRF protection configured but currently disabled for testing.
  - Injects Firebase web configuration into templates via a context processor.
  - Session-based auth with a login_required decorator protecting app pages.
  - Routes
    - Auth: / (login), /signup, /forgot-password, /reset-password/<token>, /logout
    - App pages: /homepage, /dashboard, /water_monitoring, /support, /contact
    - API: /api/sensor-data (JSON for current sensor data)
    - OAuth callback: /auth/google/callback (token processed client-side; server uses it on subsequent requests)
  - Data access is performed through a global db instance imported from database.py.

- Data layer (database.py)
  - AquaTechFirebaseDB orchestrates Firebase Firestore and Firebase Auth via firebase_config.
  - On startup: detects connectivity and seeds sample data in Firestore if empty.
  - User management
    - Email/password users through Firebase Auth with corresponding user documents in Firestore.
    - Google Sign-In via ID token verification; creates/updates user profile documents.
    - Password reset uses Firebase’s reset-link flow, with legacy token paths retained for backward compatibility.
  - Sensor data and alerts
    - get_latest_sensor_data, get_historical_sensor_data(hours), get_recent_alerts(limit) read from Firestore.
    - If Firestore is unavailable, generates realistic fallback time-series and alerts.
  - Fallback/offline mode
    - Users: fallback_users.json (hashed passwords) for basic auth flows.
    - Sensor/alerts: pseudo-random data generators for demos.

- Firebase integration (firebase_config.py)
  - Initialization strategies (first-hit wins):
    1) firebase-service-account.json in repo root
    2) FIREBASE_SERVICE_ACCOUNT_KEY env var (JSON string)
    3) GOOGLE_APPLICATION_CREDENTIALS pointing to ADC
  - Exposes clients (Firestore, Auth) and helpers
    - Verify ID tokens (including Google provider), CRUD users, password reset links.
  - Frontend web config
    - Loads firebase-web-config.json or FIREBASE_WEB_CONFIG env var.

- App launcher (start_app.py)
  - CLI entry that prints access info, demo credentials, and runs app with debug/reloader.

- Templating and assets
  - Jinja templates under templates/ render all pages listed above.
  - CSS under static/css/ handles login/signup/forgot-password flows and general styles.

Operational behavior

- With Firebase available: data is served from Firestore; sample data is auto-seeded on first run.
- Without Firebase: app remains functional using fallback users and generated sensor data; demo login defaults via DEMO_EMAIL and DEMO_PASSWORD are supported if set (hardcoded defaults exist in app.py for demo).
