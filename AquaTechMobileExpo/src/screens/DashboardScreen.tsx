import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { colors, commonStyles, spacing, typography, borderRadius, shadows, screen } from '../styles/commonStyles';

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
        <Text style={[styles.metricStatus, { color: colors.success }]}>{status}</Text>
      </View>
    </View>
  </View>
);

const AlertItem: React.FC<AlertItemProps> = ({ type, message, time }) => {
  const getAlertStyles = () => {
    switch (type) {
      case 'warning':
        return {
          backgroundColor: '#fef3c7',
          borderColor: '#fcd34d',
          iconColor: '#f59e0b',
          textColor: '#92400e',
          timeColor: '#a16207',
        };
      case 'success':
        return {
          backgroundColor: '#dcfce7',
          borderColor: '#86efac',
          iconColor: '#10b981',
          textColor: '#166534',
          timeColor: '#15803d',
        };
      default:
        return {
          backgroundColor: '#dbeafe',
          borderColor: '#93c5fd',
          iconColor: '#3b82f6',
          textColor: '#1e40af',
          timeColor: '#1d4ed8',
        };
    }
  };

  const alertStyles = getAlertStyles();
  const iconName = type === 'warning' ? 'warning' : type === 'success' ? 'check-circle' : 'info';

  return (
    <View style={[styles.alertItem, { backgroundColor: alertStyles.backgroundColor, borderColor: alertStyles.borderColor }]}>
      <MaterialIcons name={iconName as any} size={20} color={alertStyles.iconColor} />
      <View style={styles.alertContent}>
        <Text style={[styles.alertMessage, { color: alertStyles.textColor }]}>{message}</Text>
        <Text style={[styles.alertTime, { color: alertStyles.timeColor }]}>{time}</Text>
      </View>
    </View>
  );
};

const ActivityRow: React.FC<ActivityRowProps> = ({ time, action, status, details }) => {
  const getStatusStyle = () => {
    if (status === 'Success' || status === 'Complete') {
      return { backgroundColor: '#dcfce7', color: '#166534' };
    } else if (status === 'Resolved') {
      return { backgroundColor: '#fef3c7', color: '#92400e' };
    }
    return { backgroundColor: '#f3f4f6', color: '#374151' };
  };

  const statusStyle = getStatusStyle();

  return (
    <View style={styles.activityRow}>
      <Text style={styles.activityTime}>{time}</Text>
      <Text style={styles.activityAction}>{action}</Text>
      <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
        <Text style={[styles.statusText, { color: statusStyle.color }]}>{status}</Text>
      </View>
      <Text style={styles.activityDetails}>{details}</Text>
    </View>
  );
};

const DashboardScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [currentData, setCurrentData] = useState({
    temperature: '24.5',
    dissolved_oxygen: '7.2',
    ammonia: '0.15',
    timestamp: new Date().toLocaleTimeString(),
  });

  // Mock chart data
  const chartData = {
    labels: ['6h', '5h', '4h', '3h', '2h', '1h', 'now'],
    datasets: [
      {
        data: [24.2, 24.8, 24.5, 24.9, 24.3, 24.7, 24.5],
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: [6.8, 7.1, 7.0, 7.3, 6.9, 7.4, 7.2],
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: [0.12, 0.18, 0.15, 0.20, 0.14, 0.19, 0.15],
        color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const alerts = [
    {
      type: 'success' as const,
      message: 'All systems operating normally',
      time: '2 minutes ago',
    },
    {
      type: 'info' as const,
      message: 'Scheduled sensor calibration completed',
      time: '1 hour ago',
    },
    {
      type: 'warning' as const,
      message: 'Water temperature slightly elevated',
      time: '3 hours ago',
    },
  ];

  const activities = [
    {
      time: currentData.timestamp,
      action: 'Data Reading',
      status: 'Success',
      details: 'All sensors operational',
    },
    {
      time: '10:00 AM',
      action: 'Sensor Calibration',
      status: 'Complete',
      details: 'DO sensors calibrated',
    },
    {
      time: '06:00 AM',
      action: 'Water Quality Alert',
      status: 'Resolved',
      details: 'Water quality returned to normal',
    },
  ];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setCurrentData({
        ...currentData,
        timestamp: new Date().toLocaleTimeString(),
      });
      setRefreshing(false);
    }, 2000);
  }, [currentData]);

  const controlButtons = [
    { title: 'Test Water', icon: 'science', color: colors.success },
    { title: 'Calibrate Sensors', icon: 'tune', color: '#8b5cf6' },
    { title: 'Reset Alerts', icon: 'refresh', color: colors.info },
    { title: 'Export Data', icon: 'download', color: colors.gray[600] },
  ];

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard Demo</Text>
          <Text style={styles.headerSubtitle}>Real-time monitoring of your aquaculture systems</Text>
        </View>

        {/* Current Status Cards */}
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
            title="Dissolved O2"
            value={currentData.dissolved_oxygen}
            unit="mg/L"
            status="Good Level"
            icon="air"
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

        {/* Charts and Alerts */}
        <View style={styles.contentRow}>
          {/* Chart Section */}
          <View style={styles.chartCard}>
            <Text style={styles.cardTitle}>Water Quality Trends (Last 6 Hours)</Text>
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
          </View>

          {/* Alerts Section */}
          <View style={styles.alertsCard}>
            <Text style={styles.cardTitle}>System Alerts</Text>
            <View style={styles.alertsList}>
              {alerts.map((alert, index) => (
                <AlertItem key={index} {...alert} />
              ))}
            </View>

            {/* Control Panel */}
            <View style={styles.controlPanel}>
              <Text style={styles.controlTitle}>Quick Controls</Text>
              <View style={styles.controlGrid}>
                {controlButtons.map((button, index) => (
                  <TouchableOpacity key={index} style={[styles.controlButton, { backgroundColor: button.color }]}>
                    <MaterialIcons name={button.icon as any} size={16} color={colors.white} />
                    <Text style={styles.controlButtonText}>{button.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityCard}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          <View style={styles.activityHeader}>
            <Text style={styles.activityHeaderText}>Time</Text>
            <Text style={styles.activityHeaderText}>Action</Text>
            <Text style={styles.activityHeaderText}>Status</Text>
            <Text style={styles.activityHeaderText}>Details</Text>
          </View>
          {activities.map((activity, index) => (
            <ActivityRow key={index} {...activity} />
          ))}
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
  
  // Header
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
  },
  
  // Metrics
  metricsContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  metricCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricInfo: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  metricTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    marginVertical: spacing.xs,
  },
  metricUnit: {
    fontSize: typography.fontSize.lg,
    color: colors.gray[500],
  },
  metricStatus: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  
  // Content Row
  contentRow: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  
  // Chart
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: borderRadius.base,
  },
  
  // Alerts
  alertsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.medium,
  },
  alertsList: {
    marginBottom: spacing.lg,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.sm,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  alertContent: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  alertMessage: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: 2,
  },
  alertTime: {
    fontSize: typography.fontSize.xs,
  },
  
  // Control Panel
  controlPanel: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.md,
  },
  controlTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  controlGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.base,
    width: '48%',
    marginBottom: spacing.sm,
  },
  controlButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.xs,
  },
  
  // Activity
  activityCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  activityHeader: {
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  activityHeaderText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  activityTime: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.gray[900],
  },
  activityAction: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.gray[900],
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    flex: 1,
    alignItems: 'center',
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  activityDetails: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
  },
});

export default DashboardScreen;