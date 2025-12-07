import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, commonStyles, spacing, typography, borderRadius, shadows } from '../styles/commonStyles';

const ContactScreen: React.FC = () => {
  const handlePress = (type: string, value: string) => {
    switch (type) {
      case 'phone':
        Linking.openURL(`tel:${value}`);
        break;
      case 'email':
        Linking.openURL(`mailto:${value}`);
        break;
      case 'website':
        Linking.openURL(value);
        break;
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
          <MaterialIcons name="contact-mail" size={60} color={colors.white} />
          <Text style={styles.headerTitle}>Contact TilapiaSync</Text>
          <Text style={styles.headerSubtitle}>Get in touch for support or consultation</Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.contactCard}>
            <TouchableOpacity style={styles.contactItem} onPress={() => handlePress('phone', '0968 204 1378')}>
              <MaterialIcons name="phone" size={24} color={colors.primary} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>+63 968 204 1378</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={() => handlePress('email', 'tilapiasync@gmail.com')}>
              <MaterialIcons name="email" size={24} color={colors.primary} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>tilapiasync@gmail.com</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={() => handlePress('website', 'https://www.facebook.com/profile.php?id=61583273545618')}>
              <MaterialCommunityIcons name="facebook" size={24} color={colors.primary} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Facebook</Text>
                <Text style={styles.contactValue}>TilapiaSync</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.contactItem}>
              <MaterialIcons name="location-on" size={24} color={colors.primary} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Address</Text>
                <Text style={styles.contactValue}>
                  67 Campusong,{'\n'}Carmen{'\n'}United States
                </Text>
              </View>
            </View>
          </View>

        

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Emergency Support</Text>
            <Text style={styles.infoText}>
              For critical system issues, please contact our emergency hotline:
            </Text>
            <TouchableOpacity style={styles.emergencyButton} onPress={() => handlePress('phone', ' 0968 204 1378')}>
              <MaterialIcons name="warning" size={20} color={colors.white} />
              <Text style={styles.emergencyText}>Emergency: +63 968 204 1378</Text>
            </TouchableOpacity>
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
  content: {
    padding: spacing.md,
  },
  contactCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  contactInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  contactLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    fontWeight: typography.fontWeight.medium,
  },
  contactValue: {
    fontSize: typography.fontSize.base,
    color: colors.gray[900],
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  infoTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
    lineHeight: typography.fontSize.base * 1.4,
    marginBottom: spacing.xs,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    borderRadius: borderRadius.base,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  emergencyText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.sm,
  },
});

export default ContactScreen;