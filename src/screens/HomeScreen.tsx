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

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  // Quick overview cards for the device user guide
  const features = [
    {
      icon: 'settings-input-component',
      title: '1. Install the Device',
      description: 'Mount the TilapiaSync probe vertically. Submerge the temperature sensor in water, and hang the ammonia and turbidity sensors above the tank near the water surface.',

    },
    {
      icon: 'wifi',
      title: '2. Connect to Wi‑Fi',
      description: 'Turn on the device, open the TilapiaSync app, then configure the ESP32 to join your Wi-Fi from dashboard.',
    },
    
  ];

  // Step-by-step usage guidance bullets
  const waterFeatures = [
    'Check the dashboard at least twice a day for temperature,turbidity and ammmonia trends.',
    'Respond to \"Warning\" and \"Critical\" alerts immediately to avoid fish stress.',
    'Clean the probe weekly with fresh water—never use soap or chemicals.',
    'Recalibrate sensors every 30 days or after moving the device to a new tank.',
    'Keep the controller box above water level and protected from direct rain.',
    'Ensure stable Wi‑Fi within 5–10 meters of the controller for reliable uploads.',
    'Back up reports regularly using the Export Data button in the dashboard.',
    'Contact support if readings are flat or clearly unrealistic for more than 1 hour.',
  ];
  
  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
       
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
            <Text style={styles.sectionTitle}>Using Your TilapiaSync System</Text>
            <Text style={styles.sectionSubtitle}>
              Follow these guidelines to get accurate readings and extend the life of your sensors.
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
                <MaterialIcons name="menu-book" size={40} color={colors.white} />
                <Text style={styles.productTitle}>Quick Start Checklist</Text>
              </View>
              <Text style={styles.productSubtitle}>
                Complete this checklist when setting up a tank to ensure accurate, 
                stable readings from day one.
              </Text>
            </LinearGradient>

            <View style={styles.productContent}>
              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>Operational Best Practices</Text>
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
                      <Text style={styles.buttonTextOnPrimary}>View Live Sensor Readings</Text>
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
                      <Text style={styles.buttonTextOnPrimary}>Download Reports & History</Text>
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
            Need More Help With Your Device?
          </Text>
          <Text style={styles.ctaSubtitle}>
            If you still have questions after reading this guide, contact our support team for step‑by‑step
            assistance with installation or troubleshooting.
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
                <Text style={[styles.buttonCtaText, pressed && styles.buttonTextOnPrimary]}>Contact Support</Text>
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
                <Text style={[styles.buttonCtaOutlineText, pressed && { opacity: 0.9 }]}>View Data Dashboard</Text>
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