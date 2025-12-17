// DashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { db, ref, onValue, off } from '../config/firebase';
import {
  colors,
  commonStyles,
  spacing,
  typography,
  borderRadius,
  shadows,
  screen,
} from '../styles/commonStyles';

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
        <Text style={[styles.metricStatus, { color: colors.success }]}>
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

  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [
      { data: [], color: () => `rgba(239, 68, 68, 1)`, strokeWidth: 2 }, // temp
      { data: [], color: () => `rgba(34, 197, 94, 1)`, strokeWidth: 2 }, // ammonia
      { data: [], color: () => `rgba(249, 115, 22, 1)`, strokeWidth: 2 }, // turbidity
    ],
  });

  // -------------------- FIREBASE WEB SDK LISTENER --------------------
  useEffect(() => {
    const dbRef = ref(db, '/');

    onValue(dbRef, (snapshot) => {
      const raw = snapshot.val();
      if (!raw || !raw.tilapiaTank) {
        setDbStatus('No data received from Firebase');
        return;
      }

      const tank = raw.tilapiaTank;
      const temperature = Number(tank.temperature ?? 24.5);
      const ammonia = Number(tank.ammonia ?? 0.15);
      const turbidity = Number(tank.turbidity ?? 2.1);

      // Handle timestamp
      let timestamp = new Date().toISOString();
      if (typeof raw.lastUpdated === 'string') {
        timestamp = raw.lastUpdated;
      } else if (typeof tank.lastUpdated === 'string') {
        timestamp = tank.lastUpdated;
      }

      // Update current data for display
      setCurrentData({
        temperature: temperature.toFixed(1),
        ammonia: ammonia.toFixed(2),
        turbidity: turbidity.toFixed(1),
        timestamp,
      });

      // Update chart data with new readings
      setChartData((prev) => {
        const limit = 10;
        const timeLabel = new Date(timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        const newLabels = [...prev.labels, timeLabel].slice(-limit);
        
        return {
          labels: newLabels,
          datasets: [
            { 
              ...prev.datasets[0], 
              data: [...prev.datasets[0].data, temperature].slice(-limit) 
            },
            { 
              ...prev.datasets[1], 
              data: [...prev.datasets[1].data, ammonia].slice(-limit) 
            },
            { 
              ...prev.datasets[2], 
              data: [...prev.datasets[2].data, turbidity].slice(-limit) 
            },
          ],
        };
      });

      setDbStatus(`Live data - Last updated: ${new Date(timestamp).toLocaleTimeString()}`);
    }, (error) => {
      console.warn('[Dashboard] Firebase DB error:', error);
      setDbStatus('Firebase connection error');
    });

    return () => {
      off(dbRef);
    };
  }, []);

  // -------------------- Alerts & Activities --------------------
  const alerts = [
    { type: 'success' as const, message: 'All systems operating normally', time: '2 minutes ago' },
    { type: 'info' as const, message: 'Sensor calibration completed', time: '1 hour ago' },
    { type: 'warning' as const, message: 'Water temperature slightly elevated', time: '3 hours ago' },
  ];

  const activities = [
    { time: currentData.timestamp, action: 'Data Reading', status: 'Success', details: 'All sensors operational' },
  ];

  const controlButtons = [
    { title: 'Test Water', icon: 'science', color: colors.success },
    { title: 'Calibrate Sensors', icon: 'tune', color: '#8b5cf6' },
    { title: 'Reset Alerts', icon: 'refresh', color: colors.info },
    { title: 'Export Data', icon: 'download', color: colors.gray[600] },
  ];

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>{dbStatus}</Text>
        </View>

        {/* Metrics */}
        <View style={styles.metricsContainer}>
          <MetricCard
            title="Temperature"
            value={currentData.temperature}
            unit="°C"
            status="Optimal Range"
            icon="thermostat"
            iconColor="#dc2626"
            bgColor="#fee2e2"
          />
          <MetricCard
            title="Turbidity"
            value={currentData.turbidity}
            unit="NTU"
            status="Clear Water"
            icon="waves"
            iconColor="#16a34a"
            bgColor="#dcfce7"
          />
          <MetricCard
            title="Ammonia"
            value={currentData.ammonia}
            unit="mg/L"
            status="Safe Level"
            icon="science"
            iconColor="#ea580c"
            bgColor="#fed7aa"
          />
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Water Quality Trends</Text>
          {chartData.labels.length === 0 ? (
            <View style={styles.chartEmpty}>
              <Text style={styles.chartEmptyText}>Waiting for live data...</Text>
            </View>
          ) : (
            <LineChart
              data={chartData}
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
          <Text style={styles.cardTitle}>System Alerts</Text>
          <View style={styles.alertsList}>
            {alerts.map((alert, i) => <AlertItem key={i} {...alert} />)}
          </View>

          <View style={styles.controlPanel}>
            <Text style={styles.controlTitle}>Quick Controls</Text>
            <View style={styles.controlGrid}>
              {controlButtons.map((button, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.controlButton, { backgroundColor: button.color }]}
                >
                  <MaterialIcons name={button.icon as any} size={16} color={colors.white} />
                  <Text style={styles.controlButtonText}>{button.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Activity */}
        <View style={styles.activityCard}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          {activities.map((item, i) => <ActivityRow key={i} {...item} />)}
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
  chartCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg, ...shadows.medium },
  cardTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.gray[900], marginBottom: spacing.md },
  chart: { marginVertical: spacing.sm, borderRadius: borderRadius.base },
  chartEmpty: { height: 220, justifyContent: 'center', alignItems: 'center' },
  chartEmptyText: { fontSize: typography.fontSize.sm, color: colors.gray[500] },
  alertsCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, ...shadows.medium },
  alertsList: { marginBottom: spacing.lg },
  alertItem: { flexDirection: 'row', alignItems: 'flex-start', padding: spacing.sm, borderRadius: borderRadius.base, borderWidth: 1, marginBottom: spacing.sm },
  alertContent: { marginLeft: spacing.sm, flex: 1 },
  alertMessage: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, marginBottom: 2 },
  alertTime: { fontSize: typography.fontSize.xs },
  controlPanel: { borderTopWidth: 1, borderTopColor: colors.gray[200], paddingTop: spacing.md },
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
});

export default DashboardScreen;
