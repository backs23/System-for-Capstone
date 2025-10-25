import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, commonStyles, spacing, typography, borderRadius, shadows } from '../styles/commonStyles';

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

  const sensorData = [
    {
      title: 'Water Temperature',
      value: '24.5',
      unit: '°C',
      icon: 'thermostat',
      status: 'good' as const,
      description: 'Optimal range: 22-26°C',
    },
    {
      title: 'Dissolved Oxygen',
      value: '7.2',
      unit: 'mg/L',
      icon: 'air',
      status: 'good' as const,
      description: 'Minimum required: 5.0 mg/L',
    },
    {
      title: 'Ammonia',
      value: '0.15',
      unit: 'mg/L',
      icon: 'warning',
      status: 'critical' as const,
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
    setRefreshing(true);
    setTimeout(() => {
      setLastUpdate(new Date());
      setRefreshing(false);
    }, 2000);
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