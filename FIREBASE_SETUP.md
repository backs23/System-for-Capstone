# Firebase Authentication Setup Guide

## Prerequisites

1. A Google account
2. A Firebase project

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click on "Add project" and follow the instructions to create a new Firebase project
3. Once your project is created, click on "Continue"

## Step 2: Set Up Authentication

1. In your Firebase project console, click on "Authentication" in the left sidebar
2. Click on "Get started"
3. Enable the "Email/Password" and "Google" authentication methods:
   - For Email/Password: Click on the "Email/Password" provider and toggle the "Enable" switch
   - For Google: Click on the "Google" provider and toggle the "Enable" switch
4. For Google authentication, configure your OAuth consent screen and provide the necessary details

## Step 3: Generate a Service Account Key

1. In your Firebase project console, click on the gear icon (⚙️) next to "Project Overview" and select "Project settings"
2. Click on the "Service accounts" tab
3. Under "Firebase Admin SDK", click on "Generate new private key"
4. Click "Generate key" to download your service account key as a JSON file

## Step 4: Set Up Your Application

1. Rename the downloaded JSON file to `firebase-service-account.json`
2. Place this file in the root directory of your AquaTech project
3. Ensure this file is listed in your `.gitignore` to prevent accidentally committing it to version control

## Step 5: Configure Web App

1. In your Firebase project console, click on the gear icon (⚙️) and select "Project settings"
2. Under "Your apps", click on the web app icon (</>) to register a new web app
3. Enter a nickname for your app and click "Register app"
4. Copy the Firebase configuration object provided (it looks like this):
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
     measurementId: "YOUR_MEASUREMENT_ID" // Optional
   };
   ```
5. Create a file named `firebase-web-config.json` in the root directory of your AquaTech project
6. Paste the configuration object into this file (without the `const firebaseConfig =` part)
7. A template file `firebase-web-config.json.template` has been created in your project to help with this

## Security Notes

- **NEVER** commit your `firebase-service-account.json` file to version control
- Consider using environment variables for production deployments
- Restrict your Firebase API keys to specific domains in the Firebase Console

## Troubleshooting

If you encounter issues with Firebase authentication:

1. Ensure your service account key is correctly placed in the project root
2. Verify that the authentication methods are enabled in Firebase Console
3. Check browser console for any JavaScript errors
4. Ensure your Firebase project's API key is not restricted in a way that blocks your app

## Next Steps

After completing the setup, you should be able to:

1. Create new user accounts
2. Sign in with email/password
3. Sign in with Google
4. Manage user sessions
5. Reset passwords