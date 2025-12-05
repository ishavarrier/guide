import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable, TextInput, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, User, Phone, MapPinned, ArrowLeft, Mail, Lock } from 'lucide-react-native';
import { successHaptic } from '../utils/haptics';
import { colors, colorOpacity } from '../constants/theme';
import { AuthService } from '../lib/auth';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.25;

export default function CreateAccountPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ 
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
        successHaptic();
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !username.trim() || !password.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    // Password validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Username validation
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await AuthService.signUp({
        username: username.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password: password.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });
      if (result.error) {
        const errorMessage = (result.error as any)?.message || 'Registration failed. Please try again.';
        setError(errorMessage);
        return;
      }
      if (result.data) {
        successHaptic();
        router.push('/login');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = firstName.trim() !== '' && lastName.trim() !== '' && email.trim() !== '' && username.trim() !== '' && password.trim() !== '' && confirmPassword.trim() !== '' && !loading;

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
                  <Text style={styles.headerTitle}>Welcome to Mid</Text>
                  <Text style={styles.headerSubtitle}>
                    Create your profile to get started
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Body Section - Create Account Form */}
            <View style={styles.bodySection}>
              {/* Error Message */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Profile Picture */}
              <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    {profileImage ? (
                      <Text style={styles.avatarText}>📷</Text>
                    ) : (
                      <User size={40} color={colors.icon.muted} />
                    )}
                  </View>
                  <Pressable
                    onPress={handleImageUpload}
                    style={styles.cameraButton}
                    disabled={loading}
                  >
                    <Camera size={16} color={colors.icon.white} />
                  </Pressable>
                </View>
                <Text style={styles.uploadText}>
                  Upload profile picture (optional)
                </Text>
              </View>

              {/* First Name Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <User size={18} color={colors.primary} style={styles.labelIcon} />
                  <Text style={styles.inputLabel}>First Name *</Text>
                </View>
                <TextInput
                  placeholder="Enter your first name"
                  placeholderTextColor={colors.mutedForeground}
                  value={firstName}
                  onChangeText={(text) => {
                    setFirstName(text);
                    setError('');
                  }}
                  style={styles.input}
                  autoComplete="given-name"
                  editable={!loading}
                />
              </View>

              {/* Last Name Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <User size={18} color={colors.primary} style={styles.labelIcon} />
                  <Text style={styles.inputLabel}>Last Name *</Text>
                </View>
                <TextInput
                  placeholder="Enter your last name"
                  placeholderTextColor={colors.mutedForeground}
                  value={lastName}
                  onChangeText={(text) => {
                    setLastName(text);
                    setError('');
                  }}
                  style={styles.input}
                  autoComplete="family-name"
                  editable={!loading}
                />
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Mail size={18} color={colors.primary} style={styles.labelIcon} />
                  <Text style={styles.inputLabel}>Email *</Text>
                </View>
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor={colors.mutedForeground}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError('');
                  }}
                  style={styles.input}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>

              {/* Username Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <User size={18} color={colors.primary} style={styles.labelIcon} />
                  <Text style={styles.inputLabel}>Username *</Text>
                </View>
                <TextInput
                  placeholder="Choose a username"
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
                  <Text style={styles.inputLabel}>Password *</Text>
                </View>
                <TextInput
                  placeholder="Enter your password (min. 6 characters)"
                  placeholderTextColor={colors.mutedForeground}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError('');
                  }}
                  style={styles.input}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password-new"
                  editable={!loading}
                />
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Lock size={18} color={colors.primary} style={styles.labelIcon} />
                  <Text style={styles.inputLabel}>Confirm Password *</Text>
                </View>
                <TextInput
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.mutedForeground}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setError('');
                  }}
                  style={styles.input}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password-new"
                  editable={!loading}
                />
              </View>

              {/* Address Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <MapPinned size={18} color={colors.primary} style={styles.labelIcon} /> 
                  <Text style={styles.inputLabel}>Address</Text>
                </View>
                <TextInput
                  placeholder="Enter your address"
                  placeholderTextColor={colors.mutedForeground}
                  value={address}
                  onChangeText={(text) => {
                    setAddress(text);
                    setError('');
                  }}
                  style={styles.input}
                  autoComplete="street-address"
                  editable={!loading}
                />
              </View>

              {/* Phone Number Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Phone size={18} color={colors.primary} style={styles.labelIcon} />
                  <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
                </View>
                <TextInput
                  placeholder="(555) 123-4567"
                  placeholderTextColor={colors.mutedForeground}
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    setError('');
                  }}
                  style={styles.input}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  editable={!loading}
                />
              </View>

              {/* Submit Button */}
              <Pressable
                onPress={handleSubmit}
                disabled={!isFormValid}
                style={({ pressed }) => [
                  styles.submitButton,
                  !isFormValid && styles.submitButtonDisabled,
                  { opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Creating account...' : 'Continue to Mid'}
                </Text>
              </Pressable>
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
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarText: {
    fontSize: 24,
  },
  cameraButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadText: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontWeight: '400',
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
  submitButton: {
    width: '100%',
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
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

