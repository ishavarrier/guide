import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Share2,
} from "lucide-react-native";
import { colors, colorOpacity } from "../constants/theme";
import { successHaptic } from "../utils/haptics";
import { EventsService } from "../lib/events";
import { supabase } from "../lib/supabase";
import { FriendsService } from "../lib/friends";
import { AuthService } from "../lib/auth";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.25;

export default function EventDetailPage() {
  const params = useLocalSearchParams();
  const [isSaving, setIsSaving] = useState(false);
  const [eventSaved, setEventSaved] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");

  // Determine if this is a new event from restaurant selection
  const isNewEvent = params.isNewEvent === "true";

  // Get restaurant data from params if available
  const restaurantName = params.restaurantName as string | undefined;
  const restaurantAddress = params.restaurantAddress as string | undefined;

  // Parse selected friends
  const selectedFriends = params.selectedFriends
    ? JSON.parse(params.selectedFriends as string)
    : [];

  // Build event details from params
  const eventDetails = {
    title: restaurantName || "Event",
    location: restaurantAddress || "Location TBD",
  };

  // Get current user ID
  const getCurrentUserId = async (): Promise<string> => {
    // First, check if user ID was set during login (stored in FriendsService)
    const storedUserId = FriendsService.getCurrentUserId();
    if (storedUserId) {
      return storedUserId;
    }

    // Try to get authenticated user from Supabase Auth (if using Supabase Auth)
    const authResult = await AuthService.getCurrentUser();
    if (authResult.profile?.id) {
      // Store it for future use
      FriendsService.setCurrentUserId(authResult.profile.id);
      return authResult.profile.id;
    }

    // If no user found, throw an error instead of using a random user
    throw new Error("User not logged in. Please log in to continue.");
  };

  const handleShareWithFriends = async () => {
    if (eventSaved) {
      Alert.alert(
        "Event Already Saved",
        "This event has already been shared with your friends."
      );
      return;
    }

    // Date and time are always set (from Date objects), so no validation needed

    successHaptic();
    setIsSaving(true);

    try {
      const currentUserId = await getCurrentUserId();

      // Handle selectedFriends - could be array of IDs or array of objects with id property
      const friendIds = Array.isArray(selectedFriends)
        ? selectedFriends.map((friend: any) => {
            if (typeof friend === "string") return friend;
            return friend?.id || friend;
          })
        : [];

      const invitedUserIds = [currentUserId, ...friendIds];

      console.log("🎯 Saving event:", {
        title: eventDetails.title,
        location: eventDetails.location,
        date: eventDate,
        time: eventTime,
        userId: currentUserId,
        selectedFriends,
        friendIds,
        invitedUserIds,
      });

      // Create event in database
      const { data: event, error } = await EventsService.createEvent(
        eventDetails.title,
        eventDetails.location,
        currentUserId,
        invitedUserIds,
        eventDate.trim() || undefined,
        eventTime.trim() || undefined
      );

      if (error) {
        console.error("❌ Error creating event:", error);
        Alert.alert(
          "Error",
          error.message || "Failed to save event. Please try again."
        );
        setIsSaving(false);
        return;
      }

      if (event) {
        setEventSaved(true);
        console.log("✅ Event created successfully:", event.id);
        Alert.alert(
          "Event Saved!",
          "Your event has been saved and invitations have been sent.",
          [
            {
              text: "OK",
              onPress: () => {
                router.push("/events");
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("❌ Exception saving event:", error);
      Alert.alert("Error", "Failed to save event. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
              <Calendar size={28} color={colors.icon.white} strokeWidth={2} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{eventDetails.title}</Text>
              <Text style={styles.headerSubtitle}>Set date and time</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Body Section */}
        <ScrollView
          style={styles.bodySection}
          contentContainerStyle={styles.bodyScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Event Details Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Event Details</Text>

            {/* Location */}
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <MapPin size={20} color={colors.icon.muted} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{eventDetails.location}</Text>
              </View>
            </View>

            {/* Date Input */}
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Calendar size={20} color={colors.icon.muted} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Oct 25, 2025"
                  placeholderTextColor={colors.mutedForeground}
                  value={eventDate}
                  onChangeText={setEventDate}
                  editable={!isSaving && !eventSaved}
                />
              </View>
            </View>

            {/* Time Input */}
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Clock size={20} color={colors.icon.muted} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Time</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 2:00 PM"
                  placeholderTextColor={colors.mutedForeground}
                  value={eventTime}
                  onChangeText={setEventTime}
                  editable={!isSaving && !eventSaved}
                />
              </View>
            </View>
          </View>

          {/* Share with Friends Button - Only show for new events */}
          {isNewEvent && (
            <View style={styles.shareButtonContainer}>
              <Pressable
                onPress={handleShareWithFriends}
                disabled={isSaving || eventSaved}
                style={({ pressed }) => [
                  styles.shareButton,
                  (isSaving || eventSaved) && styles.shareButtonDisabled,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Share2 size={20} color={colors.icon.white} />
                <Text style={styles.shareButtonText}>
                  {eventSaved
                    ? "Event Shared"
                    : isSaving
                    ? "Saving..."
                    : "Share Midpoint with Group"}
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
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
  headerSection: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 24,
    height: HEADER_HEIGHT,
    minHeight: 180,
    maxHeight: 220,
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
    justifyContent: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colorOpacity.white["20"],
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colorOpacity.white["80"],
    fontWeight: "400",
  },
  bodySection: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bodyScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  detailIconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.foreground,
  },
  input: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.foreground,
    backgroundColor: colors.inputBackground || colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  shareButtonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  shareButton: {
    width: "100%",
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  shareButtonDisabled: {
    backgroundColor: colors.muted,
  },
  shareButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
  },
  shareButtonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  shareButton: {
    width: "100%",
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  shareButtonDisabled: {
    backgroundColor: colors.muted,
  },
  shareButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
  },
});
