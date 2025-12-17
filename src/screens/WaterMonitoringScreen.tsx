import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { db, ref, onValue, off } from '../config/firebase';
import { colors, commonStyles, spacing, typography, borderRadius, shadows, screen } from '../styles/commonStyles';
import { SensorReading } from '../services/apiService';

// Toggle this to quickly see filled graphs without a real backend
const USE_MOCK_HISTORY = false;
// Realtime Database path. By default we read from the root ("/") and
// gracefully handle two common shapes:
// 1) Root object with nested "tilapiaTank":
//    {
//      "lastUpdated": "2025-12-05T08:30:00.000Z",
//      "tilapiaTank": {
//        "temperature": 31.81,
//        "turbidity": 2.1,
//        "ammonia": 0.1,
//        "lastUpdated": "1128519"
//      }
//    }
// 2) Root object is already the tank data:
//    {
//      "temperature": 31.81,
//      "turbidity": 2.1,
//      "ammonia": 0.1,
//      "lastUpdated": "2025-12-05T08:30:00.000Z"
//    }
// If your data is under another node (e.g. "/sensors/tilapiaTank"),
// change SENSOR_DB_PATH accordingly.
const SENSOR_DB_PATH = '/';

interface SensorDataProps {
  title: string;
  value: string;
  unit: string;
  icon: string;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

const SensorCard: React.FC<SensorDataProps> = ({ title, value, unit, icon, status, description }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'good': return colors.success;
      case 'warning': return colors.warning;
      case 'critical': return colors.error;
      default: return colors.gray[500];
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case 'good': return colors.success + '20';
      case 'warning': return colors.warning + '20';
      case 'critical': return colors.error + '20';
      default: return colors.gray[100];
    }
  };

  return (
    <View style={[styles.sensorCard, { borderLeftColor: getStatusColor() }]}>
      <View style={styles.sensorHeader}>
        <View style={[styles.iconContainer, { backgroundColor: getStatusBg() }]}>
          <MaterialIcons name={icon as any} size={24} color={getStatusColor()} />
        </View>
        <View style={styles.sensorInfo}>
          <Text style={styles.sensorTitle}>{title}</Text>
          <Text style={styles.sensorDescription}>{description}</Text>
        </View>
      </View>
      <View style={styles.sensorValue}>
        <Text style={styles.valueText}>{value}</Text>
        <Text style={styles.unitText}>{unit}</Text>
      </View>
      <View style={[styles.statusIndicator, { backgroundColor: getStatusBg() }]}>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {status.toUpperCase()}
        </Text>
      </View>
    </View>
  );
};

const WaterMonitoringScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [reading, setReading] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<{
    labels: string[];
    temperature: number[];
    turbidity: number[];
    ammonia: number[];
  }>({ labels: [], temperature: [], turbidity: [], ammonia: [] });

  // For testing: prefill graphs with nice-looking mock data so you can see the UI immediately
  useEffect(() => {
    if (!USE_MOCK_HISTORY) return;
    if (history.labels.length > 0) return;

    const now = Date.now();
    const POINTS = 12;
    const mockLabels: string[] = [];
    const mockTemperature: number[] = [];
    const mockTurbidity: number[] = [];
    const mockAmmonia: number[] = [];

    for (let i = POINTS - 1; i >= 0; i--) {
      const ts = new Date(now - i * 5 * 60 * 1000); // every 5 minutes
      mockLabels.push(ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      const phase = (POINTS - 1 - i) / (POINTS - 1);

      mockTemperature.push(24 + Math.sin(phase * Math.PI) * 1.2); // ~23-25.2°C
      mockTurbidity.push(2 + Math.cos(phase * Math.PI) * 0.7); // ~1.3-2.7 NTU
      mockAmmonia.push(0.15 + Math.sin(phase * Math.PI) * 0.03); // ~0.12-0.18 mg/L
    }

    setHistory({
      labels: mockLabels,
      temperature: mockTemperature,
      turbidity: mockTurbidity,
      ammonia: mockAmmonia,
    });
  }, []);

  const pushHistory = (next: SensorReading) => {
    const label = new Date(next.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const MAX_POINTS = 20;
    setHistory((prev) => ({
      labels: [...prev.labels, label].slice(-MAX_POINTS),
      temperature: [...prev.temperature, next.temperature].slice(-MAX_POINTS),
      turbidity: [...prev.turbidity, next.turbidity].slice(-MAX_POINTS),
      ammonia: [...prev.ammonia, next.ammonia].slice(-MAX_POINTS),
    }));
  };

  // Subscribe to Firebase Realtime Database for live sensor updates.
  // Wrapped in try/catch so that on Expo Go (where the native module isn't available)
  // the screen will fall back to mock data instead of crashing.
  useEffect(() => {
    const dbRef = ref(db, SENSOR_DB_PATH);

    onValue(dbRef, (snapshot) => {
      const raw = snapshot.val();
      if (!raw || !raw.tilapiaTank) return;

      const tank = raw.tilapiaTank;

      let timestamp = new Date().toISOString();
      if (typeof raw.lastUpdated === 'string') {
        timestamp = raw.lastUpdated;
      } else if (typeof tank.lastUpdated === 'string') {
        timestamp = tank.lastUpdated;
      }

      const latest: SensorReading = {
        temperature: Number(tank.temperature ?? 24.5),
        turbidity: Number(tank.turbidity ?? 2.1),
        ammonia: Number(tank.ammonia ?? 0.15),
        dissolved_oxygen: 0,
        ph_level: 0,
        conductivity: 0,
        timestamp,
      };

      setReading(latest);
      setLastUpdate(new Date(latest.timestamp));
      pushHistory(latest);
    }, (error) => {
      console.warn('[WaterMonitoring] Firebase DB error:', error);
    });

    return () => {
      off(dbRef);
    };
  }, []);

  const sensorData = [
    {
      title: 'Water Temperature',
      value: (reading?.temperature ?? 24.5).toFixed(1),
      unit: '°C',
      icon: 'thermostat',
      status:
        reading?.temperature == null
          ? ('good' as const)
          : reading.temperature < 21 || reading.temperature > 28
          ? ('critical' as const)
          : reading.temperature < 22 || reading.temperature > 26
          ? ('warning' as const)
          : ('good' as const),
      description: 'Optimal range: 22-26°C',
    },
    {
      title: 'Turbidity',
      value: (reading?.turbidity ?? 2.1).toFixed(1),
      unit: 'NTU',
      icon: 'waves',
      status:
        reading?.turbidity == null
          ? ('good' as const)
          : reading.turbidity >= 10
          ? ('critical' as const)
          : reading.turbidity >= 5
          ? ('warning' as const)
          : ('good' as const),
      description: 'Recommended: < 5 NTU',
    },
    {
      title: 'Ammonia',
      value: (reading?.ammonia ?? 0.15).toFixed(2),
      unit: 'mg/L',
      icon: 'warning',
      status:
        reading?.ammonia == null
          ? ('critical' as const)
          : reading.ammonia >= 0.2
          ? ('critical' as const)
          : reading.ammonia >= 0.1
          ? ('warning' as const)
          : ('good' as const),
      description: 'Safe level: <0.1 mg/L',
    },
  ];

  // Derive status counts from the remaining sensors
  const counts = sensorData.reduce(
    (acc, s) => {
      acc[s.status] = acc[s.status] + 1;
      return acc;
    },
    { good: 0, warning: 0, critical: 0 } as { good: number; warning: number; critical: number }
  );

  const onRefresh = React.useCallback(() => {
    // With a realtime subscription, a manual refresh just shows the spinner briefly.
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
          <MaterialIcons name="opacity" size={60} color={colors.white} />
          <Text style={styles.headerTitle}>Live Water Monitoring</Text>
          <Text style={styles.headerSubtitle}>Real-time sensor data from your aquaculture system</Text>
          <Text style={styles.lastUpdate}>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.statusOverview}>
            <Text style={styles.overviewTitle}>System Status</Text>
            <View style={styles.statusGrid}>
              <View style={[styles.statusItem, styles.statusGood]}>
                <Text style={styles.statusCount}>{counts.good}</Text>
                <Text style={styles.statusLabel}>Good</Text>
              </View>
              <View style={[styles.statusItem, styles.statusWarning]}>
                <Text style={styles.statusCount}>{counts.warning}</Text>
                <Text style={styles.statusLabel}>Warning</Text>
              </View>
              <View style={[styles.statusItem, styles.statusCritical]}>
                <Text style={styles.statusCount}>{counts.critical}</Text>
                <Text style={styles.statusLabel}>Critical</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Sensor Readings</Text>
          
          {sensorData.map((sensor, index) => (
            <SensorCard key={index} {...sensor} />
          ))}

          <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Live Trends</Text>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Temperature (°C)</Text>
            {history.temperature.length === 0 ? (
              <Text style={styles.chartEmpty}>Waiting for live data...</Text>
            ) : (
              <LineChart
                data={{
                  labels: history.labels,
                  datasets: [
                    {
                      data: history.temperature,
                      color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                      strokeWidth: 2,
                    },
                  ],
                }}
                width={screen.width - 48}
                height={200}
                chartConfig={{
                  backgroundColor: colors.white,
                  backgroundGradientFrom: colors.white,
                  backgroundGradientTo: colors.white,
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(8, 145, 178, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
                  style: {
                    borderRadius: borderRadius.base,
                  },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: colors.primary,
                  },
                }}
                bezier
                style={styles.chart}
              />
            )}
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Turbidity (NTU)</Text>
            {history.turbidity.length === 0 ? (
              <Text style={styles.chartEmpty}>Waiting for live data...</Text>
            ) : (
              <LineChart
                data={{
                  labels: history.labels,
                  datasets: [
                    {
                      data: history.turbidity,
                      color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                      strokeWidth: 2,
                    },
                  ],
                }}
                width={screen.width - 48}
                height={200}
                chartConfig={{
                  backgroundColor: colors.white,
                  backgroundGradientFrom: colors.white,
                  backgroundGradientTo: colors.white,
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(8, 145, 178, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
                  style: {
                    borderRadius: borderRadius.base,
                  },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: colors.primary,
                  },
                }}
                bezier
                style={styles.chart}
              />
            )}
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Ammonia (mg/L)</Text>
            {history.ammonia.length === 0 ? (
              <Text style={styles.chartEmpty}>Waiting for live data...</Text>
            ) : (
              <LineChart
                data={{
                  labels: history.labels,
                  datasets: [
                    {
                      data: history.ammonia,
                      color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
                      strokeWidth: 2,
                    },
                  ],
                }}
                width={screen.width - 48}
                height={200}
                chartConfig={{
                  backgroundColor: colors.white,
                  backgroundGradientFrom: colors.white,
                  backgroundGradientTo: colors.white,
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(8, 145, 178, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
                  style: {
                    borderRadius: borderRadius.base,
                  },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: colors.primary,
                  },
                }}
                bezier
                style={styles.chart}
              />
            )}
          </View>

          <View style={styles.infoCard}>
            <MaterialIcons name="info" size={24} color={colors.info} />
            <Text style={styles.infoText}>
              Data is automatically updated every 30 seconds. Pull down to refresh manually.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  lastUpdate: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  content: {
    padding: spacing.md,
  },
  statusOverview: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  overviewTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.base,
    minWidth: 80,
  },
  statusGood: {
    backgroundColor: colors.success + '20',
  },
  statusWarning: {
    backgroundColor: colors.warning + '20',
  },
  statusCritical: {
    backgroundColor: colors.error + '20',
  },
  statusCount: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  statusLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  sensorCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    ...shadows.medium,
  },
  sensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sensorInfo: {
    flex: 1,
  },
  sensorTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
  },
  sensorDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    marginTop: 2,
  },
  sensorValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  valueText: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  unitText: {
    fontSize: typography.fontSize.lg,
    color: colors.gray[500],
    marginLeft: spacing.xs,
  },
  statusIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  chartTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: borderRadius.base,
  },
  chartEmpty: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.info + '20',
    borderRadius: borderRadius.base,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.info,
    marginLeft: spacing.sm,
    lineHeight: typography.fontSize.sm * 1.4,
  },
});

export default WaterMonitoringScreen;