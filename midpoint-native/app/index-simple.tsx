import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, User, Phone, MapPinned } from 'lucide-react-native';
import { successHaptic } from '../utils/haptics';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');

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

  const handleSubmit = () => {
    if (name.trim() && phone.trim()) {
      successHaptic();
      router.push('/locations');
    }
  };

  const isFormValid = name.trim() !== '' && phone.trim() !== '';

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
          <LinearGradient
            colors={['#dbeafe', '#fef3c7']}
            style={styles.gradient}
          >
            <View style={styles.content}>
              <View style={styles.card}>
                {/* Header */}
                <LinearGradient
                  colors={['#c2410c', '#2563eb']}
                  style={styles.header}
                >
                  <View style={styles.headerContent}>
                    <View style={styles.iconContainer}>
                      <MapPinned size={32} color="white" />
                    </View>
                    <View>
                      <Text style={styles.title}>Welcome to Mid</Text>
                      <Text style={styles.subtitle}>
                        Create your profile to get started
                      </Text>
                    </View>
                  </View>
                </LinearGradient>

                {/* Content */}
                <View style={styles.formContent}>
                  <View style={styles.form}>
                    {/* Profile Picture */}
                    <View style={styles.profileSection}>
                      <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                          {profileImage ? (
                            <Text style={styles.avatarText}>📷</Text>
                          ) : (
                            <User size={40} color="#64748b" />
                          )}
                        </View>
                        <Pressable
                          onPress={handleImageUpload}
                          style={styles.cameraButton}
                        >
                          <Camera size={16} color="white" />
                        </Pressable>
                      </View>
                      <Text style={styles.uploadText}>
                        Upload profile picture
                      </Text>
                    </View>

                    {/* Name Input */}
                    <View style={styles.inputSection}>
                      <Text style={styles.inputLabel}>Full Name</Text>
                      <TextInput
                        placeholder="Enter your full name"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                        autoComplete="name"
                      />
                    </View>

                    {/* Phone Number Input */}
                    <View style={styles.inputSection}>
                      <Text style={styles.inputLabel}>Phone Number</Text>
                      <TextInput
                        placeholder="(555) 123-4567"
                        value={phone}
                        onChangeText={setPhone}
                        style={styles.input}
                        keyboardType="phone-pad"
                        autoComplete="tel"
                      />
                    </View>

                    {/* Submit Button */}
                    <Pressable
                      onPress={handleSubmit}
                      style={[
                        styles.submitButton,
                        !isFormValid && styles.submitButtonDisabled
                      ]}
                      disabled={!isFormValid}
                    >
                      <Text style={styles.submitButtonText}>Continue to Mid</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  header: {
    padding: 24,
    paddingBottom: 32,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  formContent: {
    padding: 24,
    marginTop: -24,
  },
  form: {
    gap: 24,
  },
  profileSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#000',
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
    backgroundColor: '#c2410c',
    padding: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
  },
  inputSection: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    fontSize: 16,
  },
  submitButton: {
    height: 48,
    backgroundColor: '#c2410c',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
