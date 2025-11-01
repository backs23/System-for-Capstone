import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, commonStyles, spacing, typography, borderRadius, shadows } from '../styles/commonStyles';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

interface SensorItemProps {
  icon: string;
  name: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <View style={styles.featureCard}>
    <View style={styles.featureIconContainer}>
      <MaterialIcons name={icon as any} size={24} color={colors.white} />
    </View>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDescription}>{description}</Text>
  </View>
);

const SensorItem: React.FC<SensorItemProps> = ({ icon, name, description }) => (
  <View style={styles.sensorItem}>
    <View style={styles.sensorIconContainer}>
      <MaterialIcons name={icon as any} size={16} color={colors.primary} />
    </View>
    <View style={styles.sensorInfo}>
      <Text style={styles.sensorName}>{name}</Text>
      <Text style={styles.sensorDescription}>{description}</Text>
    </View>
  </View>
);

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const features = [
    {
      icon: 'sensors',
      title: 'Real-time Monitoring',
      description: 'Live sensor data tracking with instant updates and alerts',
    },
    {
      icon: 'analytics',
      title: 'Data Analytics',
      description: 'Advanced insights and predictive analysis for optimal results',
    },
    {
      icon: 'cloud',
      title: 'Cloud Integration',
      description: 'Secure cloud storage with remote access capabilities',
    },
    {
      icon: 'notifications',
      title: 'Smart Alerts',
      description: 'Automated notifications for critical parameter changes',
    },
  ];

  const sensors = [
    { icon: 'thermostat', name: 'Temperature', desc: 'Water temperature monitoring' },
    { icon: 'water-drop', name: 'Dissolved Oxygen', desc: 'Oxygen level tracking' },
    { icon: 'filter-alt', name: 'Ammonia', desc: 'Ammonia concentration' },
  ];

  const waterFeatures = [
    'Real-time multi-parameter monitoring',
    'Cloud-based data analytics',
    'Automated alert system',
    'Historical data trends',
    'Mobile dashboard access',
    'Predictive water quality insights',
    'ThingSpeak API integration',
    '24/7 remote monitoring',
  ];

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={[colors.primaryLight, colors.primary, colors.primaryDark]}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Next-Generation Aquaculture</Text>
            </View>
            
            <Text style={styles.heroTitle}>
              Innovative Aquaculture with{'\n'}
              <Text style={styles.highlightText}>IoT-Powered</Text>{'\n'}
              Water Quality Monitoring
            </Text>
            
            <Text style={styles.heroSubtitle}>
              Revolutionary water monitoring systems that transform aquaculture operations 
              with real-time sensor data, predictive analytics, and cloud-based insights 
              for optimal water quality management.
            </Text>
            
            <View style={styles.heroButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonPrimary,
                  pressed && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => navigation.navigate('Dashboard')}
              >
                {({ pressed }) => (
                  <>
                    <Text style={[styles.buttonText, pressed && styles.buttonTextOnPrimary]}>View Live Demo</Text>
                    <MaterialIcons name="arrow-forward" size={20} color={colors.white} style={styles.buttonIcon} />
                  </>
                )}
              </Pressable>
              
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonSecondary,
                  pressed && { backgroundColor: 'rgba(255,255,255,0.15)' },
                ]}
                onPress={() => navigation.navigate('Contact')}
              >
                {({ pressed }) => (
                  <Text style={[styles.buttonTextSecondary, pressed && { opacity: 0.9 }]}>Get Custom Quote</Text>
                )}
              </Pressable>
            </View>
          </View>
        </LinearGradient>

        {/* Feature Cards */}
        <View style={styles.featuresSection}>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </View>
        </View>

        {/* Product Showcase */}
        <View style={styles.productSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TilapiaSync Water Quality Solutions</Text>
            <Text style={styles.sectionSubtitle}>
              Comprehensive water monitoring systems designed for modern aquaculture operations
            </Text>
          </View>

          <View style={styles.productCard}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.productHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.productHeaderContent}>
                <MaterialIcons name="opacity" size={40} color={colors.white} />
                <Text style={styles.productTitle}>Water Quality Monitoring System</Text>
              </View>
              <Text style={styles.productSubtitle}>
                Comprehensive sensor network for real-time water parameter tracking with 
                advanced analytics and cloud integration
              </Text>
            </LinearGradient>

            <View style={styles.productContent}>
              <View style={styles.sensorsGrid}>
                {sensors.map((sensor, index) => (
                  <SensorItem
                    key={index}
                    icon={sensor.icon}
                    name={sensor.name}
                    description={sensor.desc}
                  />
                ))}
              </View>

              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>Key Features</Text>
                <View style={styles.featuresGrid2}>
                  {waterFeatures.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <MaterialIcons name="check-circle" size={20} color={colors.success} />
                      <Text style={styles.featureItemText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.actionButtons}>
                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    styles.buttonAction,
                    pressed && { opacity: 0.9 },
                  ]}
                  onPress={() => navigation.navigate('Monitor')}
                >
                  {() => (
                    <>
                      <Text style={styles.buttonTextOnPrimary}>Live Water Monitoring</Text>
                      <MaterialIcons name="arrow-forward" size={16} color={colors.white} style={styles.buttonIcon} />
                    </>
                  )}
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    styles.buttonAction,
                    pressed && { opacity: 0.9 },
                  ]}
                  onPress={() => navigation.navigate('Dashboard')}
                >
                  {() => (
                    <>
                      <Text style={styles.buttonTextOnPrimary}>View Dashboard</Text>
                      <MaterialIcons name="insights" size={16} color={colors.white} style={styles.buttonIcon} />
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.ctaSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.ctaTitle}>
            Ready to Transform Your Aquaculture Operation?
          </Text>
          <Text style={styles.ctaSubtitle}>
            Join leading aquaculture farms using our IoT solutions to increase efficiency and profitability
          </Text>
          <View style={styles.ctaButtons}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.buttonCta,
                pressed && { backgroundColor: colors.primary },
              ]}
              onPress={() => navigation.navigate('Contact')}
            >
              {({ pressed }) => (
                <Text style={[styles.buttonCtaText, pressed && styles.buttonTextOnPrimary]}>Schedule Consultation</Text>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.buttonCtaOutline,
                pressed && { backgroundColor: 'rgba(255,255,255,0.15)' },
              ]}
              onPress={() => navigation.navigate('Dashboard')}
            >
              {({ pressed }) => (
                <Text style={[styles.buttonCtaOutlineText, pressed && { opacity: 0.9 }]}>Try Live Demo</Text>
              )}
            </Pressable>
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Hero Section
  heroSection: {
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing.md,
  },
  heroContent: {
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  badgeText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  heroTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: typography.fontSize['3xl'] * 1.2,
  },
  highlightText: {
    color: colors.accentLight,
  },
  heroSubtitle: {
    fontSize: typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: typography.fontSize.lg * 1.5,
    paddingHorizontal: spacing.sm,
  },
  heroButtons: {
    flexDirection: 'column',
    gap: spacing.md,
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  
  // Buttons
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.base,
    minHeight: 48,
  },
  buttonPrimary: {
    backgroundColor: colors.white,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.white,
  },
  buttonAction: {
    backgroundColor: colors.primary,
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  buttonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  buttonTextOnPrimary: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  buttonTextSecondary: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  buttonIcon: {
    marginLeft: spacing.xs,
  },
  buttonCta: {
    backgroundColor: colors.white,
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  buttonCtaOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.white,
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  buttonCtaText: {
    color: colors.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  buttonCtaOutlineText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  
  // Features Section
  featuresSection: {
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    width: '47%',
    ...shadows.medium,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  featureTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: typography.fontSize.sm * 1.4,
  },
  
  // Product Section
  productSection: {
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: typography.fontSize.lg * 1.4,
  },
  productCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.large,
  },
  productHeader: {
    padding: spacing.lg,
  },
  productHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  productTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginLeft: spacing.md,
    flex: 1,
    textAlign: 'center',
  },
  productSubtitle: {
    fontSize: typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: typography.fontSize.lg * 1.4,
  },
  productContent: {
    padding: spacing.lg,
  },
  
  // Sensors
  sensorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sensorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '48%',
    marginBottom: spacing.md,
  },
  sensorIconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.base,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  sensorInfo: {
    flex: 1,
  },
  sensorName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[900],
    marginBottom: 2,
  },
  sensorDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    lineHeight: typography.fontSize.xs * 1.3,
  },
  
  // Features Container
  featuresContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.base,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  featuresTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  featuresGrid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: spacing.sm,
  },
  featureItemText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: typography.fontSize.sm * 1.3,
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  
  // CTA Section
  ctaSection: {
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: typography.fontSize['2xl'] * 1.2,
  },
  ctaSubtitle: {
    fontSize: typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: typography.fontSize.lg * 1.4,
  },
  ctaButtons: {
    flexDirection: 'column',
    gap: spacing.md,
    width: '100%',
  },
});

export default HomeScreen;