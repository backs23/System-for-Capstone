// Centralized API configuration for AquaTech Mobile
// Edit these values to point to your real backend and services.

export const API_CONFIG = {
  // IMPORTANT: When testing on a physical phone, set this to your PC's LAN IP (not 127.0.0.1)
  // Example: 'http://192.168.1.100:5000'
  BASE_URL: 'http://192.168.100.6:5000',
  USE_MOCKS: false, // Set to false to enable real network calls to Flask backend
  TIMEOUT_MS: 10000,
  ENDPOINTS: {
    authLogin: '/auth/login',
    authSignup: '/auth/signup',
    authResetPassword: '/auth/reset-password',

    sensorCurrent: '/tilapiaTank',
    chartData: '/sensors/chart',
    alerts: '/alerts',
    activityLogs: '/activity-logs',

    controlTestWater: '/control/test-water',
    controlCalibrate: '/control/calibrate',
    alertsReset: '/alerts/reset',
    exportData: '/export',
  },
  THINGSPEAK: {
    BASE_URL: 'https://api.thingspeak.com',
    CHANNEL_ID: '', // e.g. '123456'
    API_KEY: '', // Do NOT commit real secrets. Inject at build or use a secure store.
    RESULTS: 20,
  },
} as const;

export type ApiConfig = typeof API_CONFIG;
