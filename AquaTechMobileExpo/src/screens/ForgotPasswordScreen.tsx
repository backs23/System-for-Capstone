import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, commonStyles, spacing, typography, borderRadius, shadows } from '../styles/commonStyles';
import auth from '@react-native-firebase/auth';

const ForgotPasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await auth().sendPasswordResetEmail(email.trim());
      Alert.alert('Success', 'Password reset link sent to your email!', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error: any) {
      const msg = error?.message || 'Failed to send reset link';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={styles.container}>
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
          <MaterialIcons name="lock" size={60} color={colors.white} />
          <Text style={styles.headerTitle}>Reset Password</Text>
          <Text style={styles.headerSubtitle}>Enter your email to reset password</Text>
        </LinearGradient>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={20} color={colors.gray[400]} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your email"
                placeholderTextColor={colors.gray[400]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword} disabled={isLoading}>
            <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  form: {
    padding: spacing.md,
    paddingTop: spacing['2xl'],
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.base,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.gray[900],
    paddingVertical: spacing.sm,
  },
  resetButton: {
    borderRadius: borderRadius.base,
    overflow: 'hidden',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.small,
  },
  buttonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
});

export default ForgotPasswordScreen;