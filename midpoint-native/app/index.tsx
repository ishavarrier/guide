import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPinned } from 'lucide-react-native';
import { router } from 'expo-router';
import { colors, colorOpacity } from '../constants/theme';
import { successHaptic } from '../utils/haptics';

export default function WelcomeScreen() {
  const handleLogin = () => {
    successHaptic();
    router.push('/login');
  };

  const handleCreateAccount = () => {
    successHaptic();
    router.push('/create-account');
  };

  const handleBrowseAsGuest = () => {
    successHaptic();
    router.push('/locations');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Top Section - Branding with Gradient */}
        <LinearGradient
          colors={colors.gradients.header}
          style={styles.gradientSection}
        >
          <View style={styles.brandingContainer}>
            <View style={styles.iconWrapper}>
              <MapPinned size={48} color={colors.icon.white} strokeWidth={2} />
            </View>
            <Text style={styles.appName}>Mid</Text>
            <Text style={styles.tagline}>Find the perfect meeting spot</Text>
          </View>
        </LinearGradient>

        {/* Bottom Section - Action Buttons */}
        <View style={styles.actionsSection}>
          <Pressable
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.loginButton,
              { opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </Pressable>

          <Pressable
            onPress={handleCreateAccount}
            style={({ pressed }) => [
              styles.createAccountButton,
              { opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Text style={styles.createAccountButtonText}>Create Account</Text>
          </Pressable>

          <Pressable
            onPress={handleBrowseAsGuest}
            style={({ pressed }) => [
              styles.guestLink,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.guestLinkText}>Browse as Guest</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
  },
  content: {
    flex: 1,
  },
  gradientSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
  },
  brandingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: colorOpacity.white['20'],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 18,
    color: colorOpacity.white['80'],
    textAlign: 'center',
    fontWeight: '400',
  },
  actionsSection: {
    backgroundColor: colors.card,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },
  loginButton: {
    width: '100%',
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  createAccountButton: {
    width: '100%',
    height: 56,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  createAccountButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  guestLink: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  guestLinkText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.secondary,
  },
});
