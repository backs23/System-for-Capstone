// DashboardScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { db, ref, onValue, off } from '../config/firebase';
import { push, get } from 'firebase/database';
import {
  colors,
  commonStyles,
  spacing,
  typography,
  borderRadius,
  shadows,
  screen,
} from '../styles/commonStyles';
import { Share } from 'react-native';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

// -------------------- TYPES --------------------
interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  status: string;
  icon: string;
  iconColor: string;
  bgColor: string;
}

interface AlertItemProps {
  type: 'warning' | 'success' | 'info';
  message: string;
  time: string;
}

interface ActivityRowProps {
  time: string;
  action: string;
  status: string;
  details: string;
}

interface ChartDataset {
  data: number[];
  color?: (opacity?: number) => string;
  strokeWidth?: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// -------------------- COMPONENTS --------------------
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  status,
  icon,
  iconColor,
  bgColor,
}) => (
  <View style={styles.metricCard}>
    <View style={styles.metricRow}>
      <View style={[styles.metricIcon, { backgroundColor: bgColor }]}>
        <MaterialIcons name={icon as any} size={32} color={iconColor} />
      </View>
      <View style={styles.metricInfo}>
        <Text style={styles.metricTitle}>{title}</Text>
        <Text style={styles.metricValue}>
          {value}
          {unit && <Text style={styles.metricUnit}> {unit}</Text>}
        </Text>
        <Text
          style={[
            styles.metricStatus,
            { color: status === 'Critical' ? colors.error : status === 'Warning' ? colors.warning : status === 'Good' ? colors.success : colors.gray[500] },
          ]}
        >
          {status}
        </Text>
      </View>
    </View>
  </View>
);

const AlertItem: React.FC<AlertItemProps> = ({ type, message, time }) => {
  const alertStyles =
    type === 'warning'
      ? { bg: '#fef3c7', border: '#fcd34d', icon: '#f59e0b', text: '#92400e', time: '#a16207' }
      : type === 'success'
      ? { bg: '#dcfce7', border: '#86efac', icon: '#10b981', text: '#166534', time: '#15803d' }
      : { bg: '#dbeafe', border: '#93c5fd', icon: '#3b82f6', text: '#1e40af', time: '#1d4ed8' };

  const iconName =
    type === 'warning'
      ? 'warning'
      : type === 'success'
      ? 'check-circle'
      : 'info';

  return (
    <View
      style={[
        styles.alertItem,
        { backgroundColor: alertStyles.bg, borderColor: alertStyles.border },
      ]}
    >
      <MaterialIcons name={iconName as any} size={20} color={alertStyles.icon} />
      <View style={styles.alertContent}>
        <Text style={[styles.alertMessage, { color: alertStyles.text }]}>
          {message}
        </Text>
        <Text style={[styles.alertTime, { color: alertStyles.time }]}>
          {time}
        </Text>
      </View>
    </View>
  );
};

const ActivityRow: React.FC<ActivityRowProps> = ({
  time,
  action,
  status,
  details,
}) => {
  const statusStyle =
    status === 'Success' || status === 'Complete'
      ? { bg: '#dcfce7', color: '#166534' }
      : status === 'Resolved'
      ? { bg: '#fef3c7', color: '#92400e' }
      : { bg: '#f3f4f6', color: '#374151' };

  return (
    <View style={styles.activityRow}>
      <Text style={styles.activityTime}>{time}</Text>
      <Text style={styles.activityAction}>{action}</Text>
      <View
        style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
      >
        <Text style={[styles.statusText, { color: statusStyle.color }]}>
          {status}
        </Text>
      </View>
      <Text style={styles.activityDetails}>{details}</Text>
    </View>
  );
};

// -------------------- MAIN SCREEN --------------------
const DashboardScreen: React.FC = () => {
  const [dbStatus, setDbStatus] = useState('Connecting to Firebase...');
  const [currentData, setCurrentData] = useState({
    temperature: '0.0',
    turbidity: '0.0',
    ammonia: '0.00',
    timestamp: new Date().toISOString(),
  });

  // WiFi Setup State
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiStatus, setWifiStatus] = useState('');
  const [showWifiSetup, setShowWifiSetup] = useState(false);
  const [sendingWifi, setSendingWifi] = useState(false);

  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [
      { data: [], color: () => `rgba(239, 68, 68, 1)`, strokeWidth: 2 }, // temp
      { data: [], color: () => `rgba(34, 197, 94, 1)`, strokeWidth: 2 }, // ammonia
      { data: [], color: () => `rgba(249, 115, 22, 1)`, strokeWidth: 2 }, // turbidity
    ],
  });

  // guard to avoid processing extremely frequent realtime updates
  const lastUpdateRef = useRef<number>(0);
  const mountedRef = useRef(true);

  // -------------------- FIREBASE WEB SDK LISTENER --------------------
  useEffect(() => {
    mountedRef.current = true;
    const dbRef = ref(db, '/tilapiaTank');

    onValue(dbRef, (snapshot) => {
      // throttle updates to avoid rapid state churn that may cause re-render issues
      const now = Date.now();
      const minInterval = 200; // ms
      if (now - lastUpdateRef.current < minInterval) return;
      lastUpdateRef.current = now;

      if (!mountedRef.current) return;
      const tank = snapshot.val();
      if (!tank) {
        setDbStatus('No data received from Firebase');
        return;
      }

      const temperature = Number(tank.temperature ?? 24.5);
      const ammonia = Number(tank.ammonia ?? 0.15);
      const turbidity = Number(tank.turbidity ?? 2.1);

      const displayTimestamp = new Date().toISOString();

      // Update current data for display
      setCurrentData({
        temperature: temperature.toFixed(1),
        ammonia: ammonia.toFixed(2),
        turbidity: turbidity.toFixed(1),
        timestamp: displayTimestamp,
      });

      // Update chart data with new readings (use displayTimestamp for label)
      setChartData((prev) => {
        const limit = 10;
        const timeLabel = new Date(displayTimestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        const newLabels = [...prev.labels, timeLabel].slice(-limit);

        return {
          labels: newLabels,
          datasets: [
            {
              ...prev.datasets[0],
              data: [...prev.datasets[0].data, temperature].slice(-limit),
            },
            {
              ...prev.datasets[1],
              data: [...prev.datasets[1].data, ammonia].slice(-limit),
            },
            {
              ...prev.datasets[2],
              data: [...prev.datasets[2].data, turbidity].slice(-limit),
            },
          ],
        };
      });

      setDbStatus(`Live data - Last updated: ${new Date(displayTimestamp).toLocaleTimeString()}`);

      // --- generate alerts on status transitions ---
      try {
        const newTempStatus = getTempStatus(temperature);
        const newTurbStatus = getTurbidityStatus(turbidity);
        const newAmmoStatus = getAmmoniaStatus(ammonia);

        const severityOf = (s: string) => (s.startsWith('Critical') ? 'Critical' : s.startsWith('Warning') ? 'Warning' : 'Good');

        const tempSev = severityOf(newTempStatus);
        const turbSev = severityOf(newTurbStatus);
        const ammoSev = severityOf(newAmmoStatus);

        // If severity escalates to Warning/Critical from a less severe state,
        // push an alert.
        if (tempSev !== prevStatuses.current.temp) {
          if (tempSev === 'Warning' || tempSev === 'Critical') {
            addAlert(tempSev === 'Critical' ? 'critical' : 'warning', `Temperature: ${newTempStatus}`, displayTimestamp);
          }
          prevStatuses.current.temp = tempSev;
        }

        if (turbSev !== prevStatuses.current.turb) {
          if (turbSev === 'Warning' || turbSev === 'Critical') {
            addAlert(turbSev === 'Critical' ? 'critical' : 'warning', `Turbidity: ${newTurbStatus}`, displayTimestamp);
          }
          prevStatuses.current.turb = turbSev;
        }

        if (ammoSev !== prevStatuses.current.ammo) {
          if (ammoSev === 'Warning' || ammoSev === 'Critical') {
            addAlert(ammoSev === 'Critical' ? 'critical' : 'warning', `Ammonia: ${newAmmoStatus}`, displayTimestamp);
          }
          prevStatuses.current.ammo = ammoSev;
        }
      } catch (e) {
        // non-fatal
      }

      // add a Recent Activity entry summarizing this snapshot
      try {
        const details = `T:${temperature.toFixed(1)}°C  A:${ammonia.toFixed(2)}mg/L  Tu:${turbidity.toFixed(1)}NTU`;
        addActivity('Data Reading', 'Success', details, displayTimestamp);
      } catch (e) {}
    }, (error) => {
      console.warn('[Dashboard] Firebase DB error:', error);
      setDbStatus('Firebase connection error');
    });

    return () => {
      mountedRef.current = false;
      off(dbRef);
    };
  }, []);

  // -------------------- Alerts & Activities --------------------
  // Alerts state: newest first
  const [alerts, setAlerts] = useState<Array<{ id: string; type: 'warning' | 'success' | 'info' | 'critical'; message: string; time: string }>>([]);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  // track previous statuses to avoid spamming repeated alerts
  const prevStatuses = useRef({ temp: 'Good', turb: 'Good', ammo: 'Good' });

  const [activities, setActivities] = useState<ActivityRowProps[]>([]);
  const [archivedActivities, setArchivedActivities] = useState<ActivityRowProps[]>([]);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [loadingArchive, setLoadingArchive] = useState(false);
  const [lastExportUri, setLastExportUri] = useState<string | null>(null);

  const addActivity = async (action: string, status: string, details: string, time?: string) => {
    const entry: ActivityRowProps = {
      time: time ?? new Date().toISOString(),
      action,
      status,
      details,
    };

    setActivities((prev) => {
      const newList = [entry, ...prev];
      if (newList.length <= 20) return newList;
      const keep = newList.slice(0, 20);
      const removed = newList.slice(20);
      // persist removed entries to Firebase archive
      removed.forEach((item) => {
        try {
          push(ref(db, 'activityArchive')).then((r) => {
            // store under generated key
            // write actual object
            // using set via push is fine; push returned ref already created value
          });
          // we call push with object directly
          push(ref(db, 'activityArchive'), item).catch(() => {});
        } catch (e) {}
      });
      return keep;
    });
  };

  const addAlert = (type: 'warning' | 'success' | 'info' | 'critical', message: string, time: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setAlerts((prev) => [{ id, type, message, time }, ...prev]);
  };

  const deleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const loadArchivedActivities = async () => {
    setLoadingArchive(true);
    try {
      const snap = await get(ref(db, 'activityArchive'));
      const val = snap.val();
      if (!val) {
        setArchivedActivities([]);
      } else {
        const items: ActivityRowProps[] = Object.values(val).map((v: any) => ({
          time: v.time,
          action: v.action,
          status: v.status,
          details: v.details,
        }));
        // newest first: archive push order is chronological, so reverse to newest-first
        setArchivedActivities(items.reverse());
      }
    } catch (e) {
      setArchivedActivities([]);
    }
    setLoadingArchive(false);
  };

  const sendWifiCredentials = async () => {
    if (!wifiSsid.trim()) {
      setWifiStatus('❌ Please enter SSID');
      return;
    }
    if (!wifiPassword.trim()) {
      setWifiStatus('❌ Please enter password');
      return;
    }

    setSendingWifi(true);
    setWifiStatus('📡 Connecting to ESP32...');

    // Try both IPs: AP mode (192.168.4.1) and Station mode (192.168.1.100)
    const possibleIPs = ['192.168.4.1', '192.168.1.100'];
    let success = false;
    let lastError = '';

    for (const ESP32_IP of possibleIPs) {
      try {
        const body = `ssid=${encodeURIComponent(wifiSsid)}&password=${encodeURIComponent(wifiPassword)}`;
        
        console.log(`Trying ESP32 at ${ESP32_IP}...`);
        setWifiStatus(`📡 Trying ${ESP32_IP}...`);
        
        const response = await fetch(`http://${ESP32_IP}/setWifi`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body,
        });
        
        const text = await response.text();
        console.log(`ESP32 Response from ${ESP32_IP}:`, text);
        
        if (response.ok) {
          setWifiStatus('✅ ' + (text || 'WiFi credentials sent! ESP32 will restart and connect to your WiFi.'));
          success = true;
          
          // Clear fields on success
          setTimeout(() => {
            setWifiSsid('');
            setWifiPassword('');
            setWifiStatus('');
          }, 5000);
          
          break; // Exit loop on success
        }
      } catch (error: any) {
        console.log(`Failed at ${ESP32_IP}:`, error.message);
        lastError = error.message;
        // Continue to next IP
      }
    }

    if (!success) {
      setWifiStatus(
        '❌ Cannot reach ESP32\n\n' +
        'FIRST TIME SETUP:\n' +
        '1. Go to phone WiFi settings\n' +
        '2. Connect to "AquaTech-Setup"\n' +
        '3. Return to app and try again\n\n' +
        'TO UPDATE WiFi:\n' +
        'Make sure phone is on same WiFi as ESP32\n\n' +
        `Tried: ${possibleIPs.join(', ')}`
      );
    }

    setSendingWifi(false);
  };

  const controlButtons = [
    { title: 'Test Water', icon: 'science', color: colors.success },
    { title: 'Calibrate Sensors', icon: 'tune', color: '#8b5cf6' },
    { title: 'Reset Alerts', icon: 'refresh', color: colors.info },
    { title: 'Export Data', icon: 'download', color: colors.gray[600] },
  ];

  const exportDataCSV = async () => {
    try {
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        setDbStatus('Permission denied. Please enable storage permissions in settings.');
        return;
      }

      // Build Excel data from chartData (labels + datasets)
      const labels = chartData.labels || [];
      const tempDs = chartData.datasets[0]?.data || [];
      const ammoDs = chartData.datasets[1]?.data || [];
      const turbDs = chartData.datasets[2]?.data || [];

      // Create worksheet data with headers
      const wsData = [
        ['Time', 'Temperature (°C)', 'Ammonia (ppm)', 'Turbidity (%)']
      ];

      // Add data rows
      for (let i = 0; i < labels.length; i++) {
        wsData.push([
          labels[i] || '',
          tempDs[i] != null ? tempDs[i].toString() : '',
          ammoDs[i] != null ? ammoDs[i].toString() : '',
          turbDs[i] != null ? turbDs[i].toString() : '',
        ]);
      }

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Set column widths for better readability
      ws['!cols'] = [
        { wch: 15 }, // Time
        { wch: 18 }, // Temperature
        { wch: 18 }, // Ammonia
        { wch: 18 }, // Turbidity
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Water Quality Data');

      // Generate Excel file as base64
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `AquaTech_Data_${timestamp}.xlsx`;
      
      // Write to cache directory first
      const fileUri = FileSystem.cacheDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Save to device's media library (Downloads folder on Android)
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      
      // Try to add to Download album (Android) or create it
      try {
        const album = await MediaLibrary.getAlbumAsync('Download');
        if (album == null) {
          await MediaLibrary.createAlbumAsync('Download', asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
      } catch (e) {
        console.log('Could not add to Download album, file saved to media library');
      }

      setLastExportUri(fileUri);
      setDbStatus(`Excel file downloaded: ${filename}`);
      
      // Clean up cache file after a delay
      setTimeout(async () => {
        try {
          await FileSystem.deleteAsync(fileUri, { idempotent: true });
        } catch (e) {
          console.warn('Failed to clean up cache file', e);
        }
      }, 5000);

    } catch (err: any) {
      console.warn('Export failed', err);
      setDbStatus('Export failed: ' + (err.message || 'Unknown error'));
    }
  };

  // --- Derive status strings from numeric sensor values ---
  const parseNumber = (s?: string) => {
    if (s == null) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  const getTempStatus = (t: number | null) => {
    if (t == null) return 'Unknown';
    if (t < 22 || t > 34) return 'Critical Change water immediately';
    if (t < 26 || t > 30) return 'Warning';
    return 'Good';
  };

  const getTurbidityStatus = (v: number | null) => {
    if (v == null) return 'Unknown';
    if (v >= 40) return 'Critical Change water immediately';
    if (v >= 21) return 'Warning';
    return 'Good';
  };

  const getAmmoniaStatus = (v: number | null) => {
    if (v == null) return 'Unknown';
    if (v >= 1) return 'Critical Change water immediately';
    if (v >= 0.5) return 'Warning';
    return 'Good';
  };

  const tempNum = parseNumber(currentData.temperature);
  const turbNum = parseNumber(currentData.turbidity);
  const ammoNum = parseNumber(currentData.ammonia);

  const tempStatus = getTempStatus(tempNum);
  const turbStatus = getTurbidityStatus(turbNum);
  const ammoStatus = getAmmoniaStatus(ammoNum);
  // Sparsify X-axis labels so timestamps don't overlap when many points
  const makeDisplayLabels = (labels: string[], maxVisible = 6) => {
    if (!labels || labels.length <= maxVisible) return labels;
    const step = Math.ceil(labels.length / maxVisible);
    return labels.map((l, i) => (i % step === 0 ? l : ''));
  };

  // Toggle: show full labels or sparsified labels
  const [showFullLabels, setShowFullLabels] = useState(false);

  const displayChartData: ChartData = {
    ...chartData,
    labels: showFullLabels ? (chartData.labels || []) : makeDisplayLabels(chartData.labels || [], 6),
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>{dbStatus}</Text>
        </View>

        {/* WiFi Setup Card */}
        <View style={styles.wifiCard}>
          <TouchableOpacity
            onPress={() => setShowWifiSetup(v => !v)}
            style={styles.wifiHeader}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="wifi" size={24} color={colors.primary} />
              <Text style={[styles.cardTitle, { marginBottom: 0, marginLeft: spacing.sm }]}>
                WiFi Configuration
              </Text>
            </View>
            <MaterialIcons
              name={showWifiSetup ? 'expand-less' : 'expand-more'}
              size={24}
              color={colors.gray[600]}
            />
          </TouchableOpacity>

          {showWifiSetup && (
            <View style={styles.wifiContent}>
              <View style={styles.wifiInstructionBox}>
                <MaterialIcons name="info" size={20} color={colors.info} />
                <Text style={styles.wifiInstruction}>
                  FIRST TIME SETUP:{'\n'}
                  1. Connect phone to "AquaTech-Setup" WiFi{'\n'}
                  2. Return to app and enter your home WiFi{'\n'}
                  3. ESP32 will connect to your WiFi{'\n'}
                  {'\n'}
                  TO UPDATE WiFi:{'\n'}
                  Make sure phone and ESP32 are on same WiFi
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>WiFi Name (SSID)</Text>
                <View style={styles.inputContainer}>
                  <MaterialIcons name="wifi" size={20} color={colors.gray[400]} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Enter WiFi name"
                    value={wifiSsid}
                    onChangeText={setWifiSsid}
                    style={styles.textInput}
                    placeholderTextColor={colors.gray[400]}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>WiFi Password</Text>
                <View style={styles.inputContainer}>
                  <MaterialIcons name="lock" size={20} color={colors.gray[400]} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Enter WiFi password"
                    value={wifiPassword}
                    onChangeText={setWifiPassword}
                    secureTextEntry
                    style={styles.textInput}
                    placeholderTextColor={colors.gray[400]}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={sendWifiCredentials}
                disabled={sendingWifi}
                style={[
                  styles.wifiButton,
                  sendingWifi && styles.wifiButtonDisabled
                ]}
              >
                <MaterialIcons
                  name={sendingWifi ? 'hourglass-empty' : 'send'}
                  size={20}
                  color={colors.white}
                />
                <Text style={styles.wifiButtonText}>
                  {sendingWifi ? 'Sending...' : 'Configure WiFi'}
                </Text>
              </TouchableOpacity>

              {wifiStatus ? (
                <View style={[
                  styles.wifiStatusContainer,
                  wifiStatus.includes('❌')
                    ? styles.wifiStatusError
                    : styles.wifiStatusSuccess
                ]}>
                  <MaterialIcons
                    name={wifiStatus.includes('Failed') || wifiStatus.includes('Please') ? 'error' : 'check-circle'}
                    size={18}
                    color={wifiStatus.includes('Failed') || wifiStatus.includes('Please') ? colors.error : colors.success}
                  />
                  <Text style={[
                    styles.wifiStatusText,
                    { color: wifiStatus.includes('Failed') || wifiStatus.includes('Please') ? colors.error : colors.success }
                  ]}>
                    {wifiStatus}
                  </Text>
                </View>
              ) : null}
            </View>
          )}
        </View>

        {/* Metrics */}
        <View style={styles.metricsContainer}>
          <MetricCard
            title="Temperature"
            value={currentData.temperature}
            unit="°C"
            status={tempStatus}
            icon="thermostat"
            iconColor="#dc2626"
            bgColor="#fee2e2"
          />
          <MetricCard
            title="Turbidity"
            value={currentData.turbidity}
            unit="%"
            status={turbStatus}
            icon="waves"
            iconColor="#16a34a"
            bgColor="#dcfce7"
          />
          <MetricCard
            title="Ammonia"
            value={currentData.ammonia}
            unit="ppm"
            status={ammoStatus}
            icon="science"
            iconColor="#ea580c"
            bgColor="#fed7aa"
          />
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Water Quality Trends</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: spacing.sm }}>
            <TouchableOpacity onPress={() => setShowFullLabels(v => !v)} style={{ padding: 6 }}>
              <Text style={{ color: colors.primary, fontSize: typography.fontSize.sm }}>
                {showFullLabels ? 'Show Sparse Labels' : 'Show Full Labels'}
              </Text>
            </TouchableOpacity>
          </View>
          {chartData.labels.length === 0 ? (
            <View style={styles.chartEmpty}>
              <Text style={styles.chartEmptyText}>Waiting for live data...</Text>
            </View>
          ) : (
            <LineChart
              data={displayChartData}
              width={screen.width - 48}
              height={220}
              chartConfig={{
                backgroundColor: colors.white,
                backgroundGradientFrom: colors.white,
                backgroundGradientTo: colors.white,
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(8, 145, 178, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
                propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary },
              }}
              bezier
              style={styles.chart}
            />
          )}
        </View>

        {/* Alerts */}
        <View style={styles.alertsCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.cardTitle}>System Alerts</Text>
            <TouchableOpacity onPress={() => setShowAllAlerts(v => !v)} style={{ padding: 6 }}>
              <Text style={{ color: colors.primary, fontSize: typography.fontSize.sm }}>{showAllAlerts ? 'Show Latest 3' : 'Show All Alerts'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.alertsList}>
            {(() => {
              const visible = showAllAlerts ? alerts : alerts.slice(0, 3);
              return visible.map((alert) => (
                <View key={alert.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <AlertItem type={alert.type === 'critical' ? 'warning' : (alert.type as any)} message={alert.message} time={new Date(alert.time).toLocaleTimeString()} />
                  </View>
                  {showAllAlerts ? (
                    <TouchableOpacity onPress={() => deleteAlert(alert.id)} style={{ padding: spacing.xs }}>
                      <MaterialIcons name="delete" size={18} color={colors.error} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              ));
            })()}
          </View>

          <View style={styles.controlPanel}>
            <Text style={styles.controlTitle}>Quick Controls</Text>
            <View style={styles.controlGrid}>
              {controlButtons.map((button, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.controlButton, { backgroundColor: button.color }]}
                  onPress={() => {
                    if (button.title === 'Export Data') {
                      exportDataCSV();
                    } else if (button.title === 'Reset Alerts') {
                      setAlerts([]);
                      setDbStatus('Alerts reset');
                    } else {
                      setDbStatus(`${button.title} triggered`);
                    }
                  }}
                >
                  <MaterialIcons name={button.icon as any} size={16} color={colors.white} />
                  <Text style={styles.controlButtonText}>{button.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
              {lastExportUri ? (
                <View style={{ marginTop: spacing.sm }}>
                  <TouchableOpacity
                    onPress={async () => {
                        try {
                          await Share.share({ 
                            title: 'Exported Data (Excel)', 
                            message: 'AquaTech water quality data',
                            url: lastExportUri! 
                          });
                        } catch (e) {
                          console.warn('Open last export failed', e);
                          setDbStatus('Failed to share last export');
                        }
                      }}
                    style={{ padding: 8 }}
                  >
                    <Text style={{ color: colors.primary }}>Share Last Export</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
          </View>
        </View>

        {/* Activity */}
        <View style={styles.activityCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.cardTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={async () => {
              const next = !showAllActivities;
              setShowAllActivities(next);
              if (next) await loadArchivedActivities();
            }} style={{ padding: 6 }}>
              <Text style={{ color: colors.primary, fontSize: typography.fontSize.sm }}>{showAllActivities ? 'Show Latest' : 'Show All'}</Text>
            </TouchableOpacity>
          </View>

          {showAllActivities ? (
            <View>
              {loadingArchive ? <Text style={{ color: colors.gray[500] }}>Loading archive...</Text> : (
                <>
                  {activities.map((item, i) => <ActivityRow key={`a-${i}`} {...item} />)}
                  {archivedActivities.map((item, i) => <ActivityRow key={`arch-${i}`} {...item} />)}
                </>
              )}
            </View>
          ) : (
            <>
              {activities.slice(0, 3).map((item, i) => <ActivityRow key={`a-${i}`} {...item} />)}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// -------------------- STYLES --------------------
// (Copy your existing styles as-is)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.lg },
  headerTitle: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.gray[900], marginBottom: spacing.xs },
  headerSubtitle: { fontSize: typography.fontSize.base, color: colors.gray[600] },
  metricsContainer: { paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  metricCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.medium },
  metricRow: { flexDirection: 'row', alignItems: 'center' },
  metricIcon: { width: 56, height: 56, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center' },
  metricInfo: { marginLeft: spacing.lg, flex: 1 },
  metricTitle: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.gray[600], textTransform: 'uppercase', letterSpacing: 0.5 },
  metricValue: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.gray[900], marginVertical: spacing.xs },
  metricUnit: { fontSize: typography.fontSize.lg, color: colors.gray[500] },
  metricStatus: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },
  chartCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, marginHorizontal: spacing.md, marginBottom: spacing.lg, ...shadows.medium },
  cardTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.gray[900], marginBottom: spacing.md },
  chart: { marginVertical: spacing.sm, borderRadius: borderRadius.base },
  chartEmpty: { height: 220, justifyContent: 'center', alignItems: 'center' },
  chartEmptyText: { fontSize: typography.fontSize.sm, color: colors.gray[500] },
  alertsCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, marginHorizontal: spacing.md, marginBottom: spacing.lg, ...shadows.medium },
  alertsList: { marginBottom: spacing.lg },
  alertItem: { flexDirection: 'row', alignItems: 'flex-start', padding: spacing.sm, borderRadius: borderRadius.base, borderWidth: 1, marginBottom: spacing.sm },
  alertContent: { marginLeft: spacing.sm, flex: 1 },
  alertMessage: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, marginBottom: 2 },
  alertTime: { fontSize: typography.fontSize.xs },
  controlPanel: { borderTopWidth: 1, borderTopColor: colors.gray[200], paddingTop: spacing.md, marginBottom: spacing.md },
  controlTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.gray[900], marginBottom: spacing.sm },
  controlGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  controlButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.base, width: '48%', marginBottom: spacing.sm },
  controlButtonText: { color: colors.white, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, marginLeft: spacing.xs },
  activityCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, marginHorizontal: spacing.md, marginBottom: spacing.lg, ...shadows.medium },
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  activityTime: { flex: 1, fontSize: typography.fontSize.sm, color: colors.gray[900] },
  activityAction: { flex: 1, fontSize: typography.fontSize.sm, color: colors.gray[900] },
  statusBadge: { paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: borderRadius.full, flex: 1, alignItems: 'center' },
  statusText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold },
  activityDetails: { flex: 1, fontSize: typography.fontSize.sm, color: colors.gray[500] },
  // WiFi Setup Styles
  wifiCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, marginHorizontal: spacing.md, marginBottom: spacing.lg, ...shadows.medium, overflow: 'hidden' },
  wifiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  wifiContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  wifiInstructionBox: { flexDirection: 'row', backgroundColor: '#e0f2fe', borderRadius: borderRadius.base, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: '#7dd3fc' },
  wifiInstruction: { fontSize: typography.fontSize.sm, color: '#0c4a6e', marginLeft: spacing.sm, flex: 1, lineHeight: 20 },
  wifiDescription: { fontSize: typography.fontSize.sm, color: colors.gray[600], marginBottom: spacing.lg, lineHeight: 20 },
  inputGroup: { marginBottom: spacing.md },
  inputLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.gray[700], marginBottom: spacing.xs },
  inputHint: { fontSize: typography.fontSize.xs, color: colors.gray[500], marginTop: spacing.xs, marginLeft: spacing.xs },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[300], borderRadius: borderRadius.base, paddingHorizontal: spacing.sm },
  inputIcon: { marginRight: spacing.xs },
  textInput: { flex: 1, paddingVertical: spacing.sm, fontSize: typography.fontSize.base, color: colors.gray[900] },
  wifiButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.base, marginTop: spacing.sm },
  wifiButtonDisabled: { backgroundColor: colors.gray[400] },
  wifiButtonText: { color: colors.white, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, marginLeft: spacing.xs },
  wifiStatusContainer: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, padding: spacing.sm, borderRadius: borderRadius.base },
  wifiStatusSuccess: { backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#86efac' },
  wifiStatusError: { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fca5a5' },
  wifiStatusText: { fontSize: typography.fontSize.sm, marginLeft: spacing.xs, flex: 1 },
});

export default DashboardScreen;
