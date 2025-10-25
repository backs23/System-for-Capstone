import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, commonStyles, spacing, typography, borderRadius, shadows } from '../styles/commonStyles';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { GOOGLE_OAUTH } = require('../config/googleAuthConfig');
  
  // Configure Google Sign-In
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_OAUTH.webClientId,
      offlineAccess: false,
    });
    console.log('🚀 Firebase Auth Google Sign-In configured');
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Sign in with Firebase Auth using email and password
      await auth().signInWithEmailAndPassword(email.trim(), password);
      
      // Navigate to main tabs on successful login
      const { resetToMainTabs } = await import('../navigation/navigationRef');
      resetToMainTabs();
    } catch (error: any) {
      let msg = 'Please check your credentials and try again.';
      
      // Map Firebase error codes to user-friendly messages
      if (error?.code === 'auth/invalid-email') {
        msg = 'Invalid email address.';
      } else if (error?.code === 'auth/user-disabled') {
        msg = 'This account has been disabled.';
      } else if (error?.code === 'auth/user-not-found') {
        msg = 'No account found with this email.';
      } else if (error?.code === 'auth/wrong-password') {
        msg = 'Incorrect password.';
      } else if (error?.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (error?.message) {
        msg = error.message;
      }
      
      Alert.alert('Login Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.logoContainer}>
              {/* App Logo - place your uploaded image at assets/tilapia-logo.png */}
              {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
              <> 
                <View style={styles.logoShadowContainer}>
                  <View style={styles.logoImageWrapper}>
                    <Image
                      source={require('../../assets/icon.png')}
                      style={styles.logoImage}
                    />
                  </View>
                </View>
                <Text style={styles.logoText}>TilapiaSync</Text>
                <Text style={styles.logoSubtext}>IoT Water Quality Monitoring</Text>
              </>
            </View>
          </LinearGradient>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to access your aquaculture monitoring dashboard
            </Text>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <MaterialIcons name="email" size={20} color={colors.gray[400]} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.gray[400]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <MaterialIcons name="lock" size={20} color={colors.gray[400]} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.gray[400]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color={colors.gray[400]}
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? [colors.gray[400], colors.gray[500]] : [colors.primary, colors.primaryDark]}
                style={styles.loginButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <Text style={styles.loginButtonText}>Signing In...</Text>
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Sign In</Text>
                    <MaterialIcons name="arrow-forward" size={20} color={colors.white} style={styles.buttonIcon} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>


            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign-In */}
            <TouchableOpacity
              style={styles.socialButton}
              onPress={async () => {
                try {
                  console.log('🚀 Starting Firebase Auth Google Sign-In...');
                  
                  // Check if device supports Google Play Services
                  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
                  
                  // Sign in with Google
                  await GoogleSignin.signIn();
                  
                  // Get tokens after successful sign in
                  const tokens = await GoogleSignin.getTokens();
                  
                  if (!tokens.idToken) {
                    throw new Error('No ID token received from Google');
                  }
                  
                  // Create a Google credential with the token
                  const googleCredential = auth.GoogleAuthProvider.credential(tokens.idToken);
                  
                  // Sign in to Firebase with the Google credential
                  await auth().signInWithCredential(googleCredential);
                  
                  console.log('✅ Google Sign-In successful');
                  
                  // Navigate to main tabs
                  const { resetToMainTabs } = await import('../navigation/navigationRef');
                  resetToMainTabs();
                } catch (error: any) {
                  if (error.code === 'sign_in_cancelled') {
                    // User cancelled the sign-in flow
                    console.log('User cancelled Google Sign-In');
                    return;
                  }
                  
                  let msg = 'Failed to sign in with Google';
                  if (error?.message) {
                    msg = error.message;
                  }
                  
                  Alert.alert('Google Sign-In Failed', msg);
                }
              }}
            >
              <FontAwesome name="google" size={20} color={colors.gray[600]} />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Sign Up */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: spacing['4xl'], // Ensure content is above navigation
  },
  
  // Header
  header: {
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginTop: spacing.md,
  },
  logoShadowContainer: {
    marginBottom: spacing.sm,
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    backgroundColor: colors.white, // ensure circular shadow outline on Android
  },
  logoImageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.white,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    resizeMode: 'cover',
    transform: [{ scale: 1.25 }], // zoom into center for better fish visibility
  },
  logoSubtext: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs,
  },
  
  // Form
  formContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing['2xl'],
  },
  welcomeTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: typography.fontSize.base * 1.4,
  },
  
  // Input Groups
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
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
  inputError: {
    borderColor: colors.error,
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
  eyeIcon: {
    padding: spacing.xs,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
  
  // Forgot Password
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
  },
  forgotPasswordText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  
  // Login Button
  loginButton: {
    borderRadius: borderRadius.base,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  loginButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
  },
  buttonIcon: {
    marginLeft: spacing.sm,
  },
  
  // Demo Container
  demoContainer: {
    backgroundColor: colors.info + '20',
    borderRadius: borderRadius.base,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  demoText: {
    fontSize: typography.fontSize.sm,
    color: colors.info,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[300],
  },
  dividerText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    paddingHorizontal: spacing.md,
  },
  
  // Social Button
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.base,
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
  },
  socialButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[700],
    marginLeft: spacing.sm,
  },
  
  // Sign Up
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['4xl'], // Increased bottom margin to avoid navigation overlap
    paddingBottom: spacing.md, // Additional padding for safety
  },
  signupText: {
    fontSize: typography.fontSize.base,
    color: colors.gray[600],
  },
  signupLink: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
});

export default LoginScreen;