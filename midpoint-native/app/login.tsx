import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPinned, ArrowLeft, User, Lock } from 'lucide-react-native';
import { router } from 'expo-router';
import { colors, colorOpacity } from '../constants/theme';
import { successHaptic } from '../utils/haptics';
import { AuthService } from '../lib/auth';
import { FriendsService } from '../lib/friends';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.25;

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await AuthService.signIn({
        username: username.trim(),
        password: password.trim(),
      });
      if (result.error) {
        setError(result.error.message || 'Login failed. Please try again.');
        return;
      }
      if (result.data) {
        // Store user ID for friends service
        if (result.data.profile?.id) {
          FriendsService.setCurrentUserId(result.data.profile.id);
        }
        successHaptic();
        router.replace('/home');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    successHaptic();
    // TODO: Implement forgot password logic
    console.log('Forgot password');
  };

  const handleCreateAccount = () => {
    successHaptic();
    router.push('/create-account');
  };

  const isFormValid = username.trim() !== '' && password.trim() !== '' && !loading;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex1}
      >
        <ScrollView
          style={styles.flex1}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header Section with Gradient */}
            <LinearGradient
              colors={colors.gradients.header}
              style={styles.headerSection}
            >
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.backButton,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <ArrowLeft size={24} color={colors.icon.white} />
              </Pressable>

              <View style={styles.headerContent}>
                <View style={styles.iconContainer}>
                  <MapPinned size={28} color={colors.icon.white} strokeWidth={2} />
                </View>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle}>Welcome Back</Text>
                  <Text style={styles.headerSubtitle}>Login to your account</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Body Section - Login Form */}
            <View style={styles.bodySection}>
              {/* Error Message */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Username Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <User size={18} color={colors.primary} style={styles.labelIcon} />
                  <Text style={styles.inputLabel}>Username</Text>
                </View>
                <TextInput
                  placeholder="Enter your username"
                  placeholderTextColor={colors.mutedForeground}
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    setError('');
                  }}
                  style={styles.input}
                  autoCapitalize="none"
                  autoComplete="username"
                  editable={!loading}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Lock size={18} color={colors.primary} style={styles.labelIcon} />
                  <Text style={styles.inputLabel}>Password</Text>
                </View>
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor={colors.mutedForeground}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError('');
                  }}
                  style={styles.input}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password"
                  editable={!loading}
                />
                <Pressable
                  onPress={handleForgotPassword}
                  style={({ pressed }) => [
                    styles.forgotPasswordLink,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </Pressable>
              </View>

              {/* Login Button */}
              <Pressable
                onPress={handleLogin}
                disabled={!isFormValid}
                style={({ pressed }) => [
                  styles.loginButton,
                  !isFormValid && styles.loginButtonDisabled,
                  { opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Logging in...' : 'Login to Mid'}
                </Text>
              </Pressable>

              {/* Create Account Link */}
              <View style={styles.createAccountContainer}>
                <Text style={styles.createAccountPrompt}>Don't have an account? </Text>
                <Pressable
                  onPress={handleCreateAccount}
                  style={({ pressed }) => [
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Text style={styles.createAccountLink}>Create one</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
  headerSection: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 24,
    height: HEADER_HEIGHT,
    minHeight: 180,
    maxHeight: 220,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colorOpacity.white['20'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colorOpacity.white['80'],
    fontWeight: '400',
  },
  bodySection: {
    flex: 1,
    backgroundColor: colors.card,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  labelIcon: {
    marginRight: 4,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
  },
  input: {
    height: 56,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.foreground,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.secondary,
  },
  loginButton: {
    width: '100%',
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  createAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  createAccountPrompt: {
    fontSize: 16,
    color: colors.mutedForeground,
  },
  createAccountLink: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: colors.destructive,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 14,
    fontWeight: '500',
  },
});

