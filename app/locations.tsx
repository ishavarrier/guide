import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Dimensions,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin, Plus, X, Search, ArrowLeft, User } from "lucide-react-native";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/Card";
import { Avatar, AvatarFallback } from "../components/ui/Avatar";
import { Separator } from "../components/ui/Separator";
import { FriendCarousel } from "../components/FriendCarousel";
import { ActivitySelector } from "../components/ActivitySelector";
import { LocationInputWithAutocomplete } from "../components/LocationInputWithAutocomplete";
import { Friend, LocationEntry } from "../utils/types";
import { successHaptic } from "../utils/haptics";
import { colors, colorOpacity } from "../constants/theme";
import PlacesService from "../services/PlacesService";
import { getApiBaseUrl } from "../utils/network";
import Navbar from "../components/Navbar";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.25;

export default function LocationsPage() {
  const [activity, setActivity] = useState("restaurants");
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [locations, setLocations] = useState<LocationEntry[]>([
    { id: "me", personName: "Me", location: "", isMe: true },
  ]);
  const [coordinates, setCoordinates] = useState<{
    [key: string]: { lat: number; lng: number };
  }>({});
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Handle keyboard visibility to hide navbar
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setIsKeyboardVisible(true)
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setIsKeyboardVisible(false)
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Update locations when friends change
  useEffect(() => {
    setLocations([
      { id: "me", personName: "Me", location: "", isMe: true },
      ...selectedFriends.map((f) => ({
        id: f.id,
        personName: f.name,
        location: f.address || "", // Auto-fill address if available
      })),
    ]);
  }, [selectedFriends]);

  const handleFriendsChange = (friends: Friend[]) => {
    setSelectedFriends(friends);
  };

  const updateLocation = (id: string, value: string) => {
    setLocations(
      locations.map((loc) =>
        loc.id === id ? { ...loc, location: value } : loc
      )
    );
  };

  const handlePlaceSelect = async (id: string, place: any) => {
    try {
      console.log(`📍 Getting place details for ${id}:`, place.place_id);
      // Get coordinates from place details
      const placeDetails = await PlacesService.getPlaceDetails(place.place_id);
      if (
        placeDetails &&
        placeDetails.geometry &&
        placeDetails.geometry.location
      ) {
        const coords = {
          lat: placeDetails.geometry.location.lat,
          lng: placeDetails.geometry.location.lng,
        };

        setCoordinates((prev) => ({
          ...prev,
          [id]: coords,
        }));

        console.log(`✅ Coordinates for ${id}:`, coords);
      }
    } catch (error) {
      console.error("❌ Error getting place coordinates:", error);
    }
  };

  const addMoreLocation = () => {
    setLocations([
      ...locations,
      {
        id: `extra-${Date.now()}`,
        personName: "Additional Person",
        location: "",
      },
    ]);
  };

  const removeLocation = (id: string) => {
    if (id !== "me") {
      setLocations(locations.filter((loc) => loc.id !== id));
    }
  };

  const handleSearch = async () => {
    console.log("🔍 Find Midpoint button pressed!");
    console.log("  isValid:", isValid);
    console.log("  locations:", locations);
    console.log("  coordinates:", coordinates);

    try {
      successHaptic();

      // Get coordinates for all locations
      const coordsArray = locations
        .filter((loc) => coordinates[loc.id])
        .map((loc) => ({
          lat: coordinates[loc.id].lat,
          lng: coordinates[loc.id].lng,
        }));

      console.log("  📍 Coordinates array:", coordsArray);

      if (coordsArray.length < 2) {
        alert("Please select valid locations for at least 2 people");
        return;
      }

      // Convert activity to filters
      const getActivityFilters = (activityType: string): string[] => {
        switch (activityType) {
          case "restaurants":
            return ["restaurant"];
          case "cafes":
            return ["cafe"];
          case "shopping":
            return ["shopping_mall", "store"];
          case "entertainment":
            return ["movie_theater", "amusement_park", "zoo"];
          default:
            return ["restaurant", "cafe"];
        }
      };

      // Call backend API
      const request = {
        coords: coordsArray,
        filters: getActivityFilters(activity),
      };

      console.log("🎯 Calling midpoint API:", request);
      const apiBaseUrl = getApiBaseUrl().replace("/api/places", "");
      const endpoint = `${apiBaseUrl}/api/places/midpoint`;
      console.log("  🔗 Endpoint:", endpoint);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      console.log("  📊 Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Midpoint data received:", data);

        // Navigate to map page with the data
        router.push({
          pathname: "/map",
          params: {
            activity: activity,
            midpointData: JSON.stringify(data),
            selectedFriends: JSON.stringify(selectedFriends),
          },
        });
      } else {
        const errorText = await response.text();
        console.error("❌ API call failed:", response.status, errorText);
        alert("Failed to find midpoint. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error in handleSearch:", error);
      alert("Error finding midpoint. Please check your connection.");
    }
  };

  const isValid = locations.every((loc) => loc.location.trim() !== "");

  // Debug validation
  console.log("Validation check:");
  console.log("locations:", locations);
  console.log("isValid:", isValid);
  locations.forEach((loc, index) => {
    console.log(
      `Location ${index}: "${loc.location}" - valid: ${
        loc.location.trim() !== ""
      }`
    );
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
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
                <MapPin size={28} color={colors.icon.white} strokeWidth={2} />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Plan Your Meetup</Text>
                <Text style={styles.headerSubtitle}>
                  Invite friends & set locations
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Body Section - Form Content */}
          <ScrollView
            style={styles.bodySection}
            contentContainerStyle={styles.bodyScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Friend Carousel */}
            <View style={styles.section}>
              <FriendCarousel onFriendsChange={handleFriendsChange} />
            </View>

            {/* Locations List */}
            <View style={styles.section}>
              <View style={styles.locationsList}>
                {locations.map((loc, index) => (
                  <View key={loc.id} style={styles.locationCard}>
                    <View style={styles.locationCardContainer}>
                      <View style={styles.locationRow}>
                        <View style={styles.avatarContainer}>
                          {loc.isMe ? (
                            <View style={styles.meIconContainer}>
                              <User size={18} color={colors.secondary} />
                            </View>
                          ) : (
                            <Avatar className="w-10 h-10 ring-2 ring-secondary/50">
                              <AvatarFallback className="bg-secondary/10 text-secondary">
                                <Text style={styles.avatarText}>
                                  {loc.personName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                                </Text>
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </View>
                        <View style={styles.locationInputContainer}>
                          <Text style={styles.locationLabel}>
                            {loc.personName}
                          </Text>
                          <LocationInputWithAutocomplete
                            placeholder="Enter location or address"
                            value={loc.location}
                            onChangeText={(value) =>
                              updateLocation(loc.id, value)
                            }
                            onSelectPlace={(place) =>
                              handlePlaceSelect(loc.id, place)
                            }
                            style={styles.locationInput}
                            autoComplete="street-address"
                          />
                        </View>
                        {!loc.isMe && (
                          <Pressable
                            onPress={() => removeLocation(loc.id)}
                            style={({ pressed }) => [
                              styles.removeButton,
                              { opacity: pressed ? 0.8 : 1 },
                            ]}
                          >
                            <X size={18} color={colors.icon.muted} />
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Add More Button */}
            <View style={styles.section}>
              <Pressable
                onPress={addMoreLocation}
                style={({ pressed }) => [
                  styles.addMoreButton,
                  { opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <Plus size={18} color={colors.primary} />
                <Text style={styles.addMoreButtonText}>Add More Location</Text>
              </Pressable>
            </View>

            {/* Activity Selector */}
            <View style={styles.section}>
              <ActivitySelector selected={activity} onSelect={setActivity} />
            </View>

            {/* Search Button */}
            <View style={styles.section}>
              <Pressable
                onPress={handleSearch}
                disabled={!isValid}
                style={({ pressed }) => [
                  styles.findMidpointButton,
                  !isValid && styles.findMidpointButtonDisabled,
                  { opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <Search size={20} color={colors.icon.white} />
                <Text style={styles.findMidpointButtonText}>Find Midpoint</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
        {!isKeyboardVisible && <Navbar />}
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
    backgroundColor: colors.card,
  },
  bodyScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  locationsList: {
    gap: 16,
  },
  locationCard: {
    marginBottom: 16,
  },
  locationCardContainer: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  meIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colorOpacity.secondary["20"],
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.secondary,
  },
  locationInputContainer: {
    flex: 1,
    gap: 6,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.foreground,
    marginBottom: 4,
  },
  locationInput: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
    fontSize: 16,
  },
  removeButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addMoreButton: {
    width: "100%",
    height: 56,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
  },
  addMoreButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
  },
  findMidpointButton: {
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
  findMidpointButtonDisabled: {
    opacity: 0.5,
  },
  findMidpointButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
  },
});
