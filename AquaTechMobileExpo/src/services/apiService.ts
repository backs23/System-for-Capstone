// API Service for AquaTech Mobile App
// This file contains functions for fetching data from your backend API

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/apiConfig';

interface SensorReading {
  temperature: number;
  dissolved_oxygen: number;
  ph_level: number;
  turbidity: number;
  conductivity: number;
  ammonia: number;
  timestamp: string;
}

interface AlertData {
  id: string;
  type: 'warning' | 'success' | 'info';
  message: string;
  time: string;
  resolved: boolean;
}

interface ActivityLog {
  id: string;
  time: string;
  action: string;
  status: string;
  details: string;
}

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    // Base URL now comes from centralized config
    this.baseUrl = API_CONFIG.BASE_URL;
    // Try to hydrate token on startup (best-effort; no await in constructor)
    this.loadToken();
  }

  private async loadToken() {
    try {
      const saved = await AsyncStorage.getItem('auth_token');
      if (saved) this.token = saved;
    } catch {}
  }

  private async saveToken(token: string) {
    this.token = token;
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch {}
  }

  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const id = setTimeout(() => reject(new Error('Request timed out')), ms);
      promise
        .then((res) => {
          clearTimeout(id);
          resolve(res);
        })
        .catch((err) => {
          clearTimeout(id);
          reject(err);
        });
    });
  }

  private async request<T>(path: string, init: RequestInit = {}, auth = false): Promise<T> {
    if (API_CONFIG.USE_MOCKS) {
      throw new Error('Real network calls are disabled (USE_MOCKS=true). Update API_CONFIG to enable.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(init.headers as Record<string, string>),
      };

      if (auth && this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const res = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers,
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
      }

      // Try parse JSON; fall back to text
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return (await res.json()) as T;
      }
      return (await res.text()) as unknown as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  // Expose for tests/debug
  public getBaseUrl() {
    return this.baseUrl;
  }

  // Simulate API calls for demo purposes
  private async simulateApiCall<T>(data: T, delay: number = 1000): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(data);
      }, delay);
    });
  }

  // Get current sensor readings
  async getSensorData(): Promise<SensorReading> {
    if (API_CONFIG.USE_MOCKS) {
      const mockData: SensorReading = {
        temperature: 24.5 + (Math.random() - 0.5) * 2, // 23.5-25.5
        dissolved_oxygen: 7.2 + (Math.random() - 0.5) * 0.4, // 7.0-7.4
        ph_level: 7.5 + (Math.random() - 0.5) * 0.6, // 7.2-7.8
        turbidity: 2.1 + (Math.random() - 0.5) * 0.8, // 1.7-2.5
        conductivity: 450 + (Math.random() - 0.5) * 50, // 425-475
        ammonia: 0.15 + (Math.random() - 0.5) * 0.1, // 0.1-0.2
        timestamp: new Date().toISOString(),
      };
      return this.simulateApiCall(mockData);
    }

    return this.request<SensorReading>(API_CONFIG.ENDPOINTS.sensorCurrent, { method: 'GET' }, true);
  }

  // Get historical chart data
  async getChartData(): Promise<{
    labels: string[];
    temperature: number[];
    dissolved_oxygen: number[];
    ammonia: number[];
  }> {
    const mockChartData = {
      labels: ['6h', '5h', '4h', '3h', '2h', '1h', 'now'],
      temperature: [24.2, 24.8, 24.5, 24.9, 24.3, 24.7, 24.5],
      dissolved_oxygen: [6.8, 7.1, 7.0, 7.3, 6.9, 7.4, 7.2],
      ammonia: [0.12, 0.18, 0.15, 0.20, 0.14, 0.19, 0.15],
    };

    return this.simulateApiCall(mockChartData);
  }

  // Get system alerts
  async getAlerts(): Promise<AlertData[]> {
    const mockAlerts: AlertData[] = [
      {
        id: '1',
        type: 'success',
        message: 'All systems operating normally',
        time: '2 minutes ago',
        resolved: true,
      },
      {
        id: '2',
        type: 'info',
        message: 'Scheduled sensor calibration completed',
        time: '1 hour ago',
        resolved: true,
      },
      {
        id: '3',
        type: 'warning',
        message: 'Water temperature slightly elevated',
        time: '3 hours ago',
        resolved: false,
      },
    ];

    return this.simulateApiCall(mockAlerts);
  }

  // Get activity logs
  async getActivityLogs(): Promise<ActivityLog[]> {
    const mockLogs: ActivityLog[] = [
      {
        id: '1',
        time: new Date().toLocaleTimeString(),
        action: 'Data Reading',
        status: 'Success',
        details: 'All sensors operational',
      },
      {
        id: '2',
        time: '10:00 AM',
        action: 'Sensor Calibration',
        status: 'Complete',
        details: 'DO sensors calibrated',
      },
      {
        id: '3',
        time: '06:00 AM',
        action: 'Water Quality Alert',
        status: 'Resolved',
        details: 'Water quality returned to normal',
      },
    ];

    return this.simulateApiCall(mockLogs);
  }

  // Authentication methods
  async login(email: string, password: string): Promise<{
    success: boolean;
    token?: string;
    user?: { id: string; email: string; name: string };
    error?: string;
  }> {
    if (API_CONFIG.USE_MOCKS) {
      if (email && password) {
        return this.simulateApiCall({
          success: true,
          token: 'mock-jwt-token',
          user: {
            id: '1',
            email: email,
            name: 'Demo User',
          },
        });
      }
      return this.simulateApiCall({ success: false, error: 'Invalid credentials' });
    }

    try {
      const result = await this.request<{ token: string; user?: { id: string; email: string; name: string } }>(
        API_CONFIG.ENDPOINTS.authLogin,
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        },
        false,
      );

      if (result?.token) {
        await this.saveToken(result.token);
        return { success: true, token: result.token, user: result.user };
      }
      return { success: false, error: 'Login failed' };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Login error' };
    }
  }

  async signup(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<{
    success: boolean;
    message: string;
  }> {
    // Simulate signup
    return this.simulateApiCall({
      success: true,
      message: 'Account created successfully',
    });
  }

  async resetPassword(email: string): Promise<{
    success: boolean;
    message: string;
  }> {
    // Simulate password reset
    return this.simulateApiCall({
      success: true,
      message: 'Password reset link sent to your email',
    });
  }

  // Control system methods
  async testWater(): Promise<{ success: boolean; message: string }> {
    return this.simulateApiCall({
      success: true,
      message: 'Water test initiated successfully',
    });
  }

  async calibrateSensors(): Promise<{ success: boolean; message: string }> {
    return this.simulateApiCall({
      success: true,
      message: 'Sensor calibration started',
    });
  }

  async resetAlerts(): Promise<{ success: boolean; message: string }> {
    return this.simulateApiCall({
      success: true,
      message: 'All alerts have been reset',
    });
  }

  async exportData(): Promise<{ success: boolean; url?: string; message: string }> {
    return this.simulateApiCall({
      success: true,
      url: 'https://example.com/export-data.csv',
      message: 'Data export ready for download',
    });
  }

  // ThingSpeak integration (if you're using ThingSpeak API)
  async getThingSpeakData(channelId: string, apiKey: string): Promise<any> {
    // In a real implementation:
    // const response = await fetch(`https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=20`);
    // return response.json();

    // Mock ThingSpeak response
    const mockThingSpeakData = {
      channel: {
        id: channelId,
        name: 'AquaTech Sensors',
        description: 'Water quality monitoring sensors',
        latitude: '0.0',
        longitude: '0.0',
        field1: 'Temperature',
        field2: 'Dissolved Oxygen',
        field3: 'pH Level',
        field4: 'Ammonia',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
        last_entry_id: 100
      },
      feeds: Array.from({ length: 20 }, (_, i) => ({
        created_at: new Date(Date.now() - i * 30000).toISOString(),
        entry_id: 100 - i,
        field1: (24.5 + (Math.random() - 0.5) * 2).toFixed(1),
        field2: (7.2 + (Math.random() - 0.5) * 0.4).toFixed(1),
        field3: (7.5 + (Math.random() - 0.5) * 0.6).toFixed(1),
        field4: (0.15 + (Math.random() - 0.5) * 0.1).toFixed(2),
      }))
    };

    return this.simulateApiCall(mockThingSpeakData);
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export types for use in components
export type {
  SensorReading,
  AlertData,
  ActivityLog,
};