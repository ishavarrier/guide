import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  Image,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { environment } from "../config/environment";
import {
  ArrowLeft,
  MapPin,
  Star,
  Navigation,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Share2,
} from "lucide-react-native";
import { successHaptic } from "../utils/haptics";
import { colors, colorOpacity } from "../constants/theme";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

export default function MidpointMapPage() {
  const params = useLocalSearchParams<{
    activity?: string;
    midpointData?: string;
    selectedFriends?: string; // JSON stringified array of friend IDs
  }>();
  const midpointData = params.midpointData
    ? JSON.parse(params.midpointData)
    : null;
  const activity = params.activity || "restaurants";
  const selectedFriends = params.selectedFriends
    ? JSON.parse(params.selectedFriends)
    : [];

  const [sheetExpanded, setSheetExpanded] = React.useState(true);

  // Default center (San Francisco) - will be updated with actual midpoint data
  const center =
    midpointData?.midpoint?.lat && midpointData?.midpoint?.lng
      ? { lat: midpointData.midpoint.lat, lng: midpointData.midpoint.lng }
      : midpointData?.midpointLat && midpointData?.midpointLng
      ? { lat: midpointData.midpointLat, lng: midpointData.midpointLng }
      : { lat: 37.78825, lng: -122.4324 };

  // Check if API key is available
  const apiKey = environment.GOOGLE_MAPS_API_KEY;
  console.log("🗺️ Map API Key:", apiKey ? "Set" : "NOT SET");

  // Generate HTML for Google Maps
  const mapHtml = useMemo(() => {
    const key = environment.GOOGLE_MAPS_API_KEY || "";
    if (!key) {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                margin: 0; 
                padding: 0; 
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                font-family: Arial, sans-serif;
                background: #f0f0f0;
              }
              .error {
                text-align: center;
                color: #666;
                padding: 20px;
              }
            </style>
          </head>
          <body>
            <div class="error">
              <h3>Google Maps API Key Not Set</h3>
              <p>Please set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in your environment</p>
            </div>
          </body>
        </html>
      `;
    }

    // Prepare markers data
    const placeMarkers: Array<{
      lat: number;
      lng: number;
      title: string;
      icon: string;
    }> = [];

    // Add markers for found places (restaurants, cafes, etc.)
    if (midpointData?.places) {
      midpointData.places.forEach((place: any, index: number) => {
        if (place.coordinates?.lat && place.coordinates?.lng) {
          placeMarkers.push({
            lat: place.coordinates.lat,
            lng: place.coordinates.lng,
            title: place.name || `Place ${index + 1}`,
            icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
          });
        }
      });
    }

    // Add star markers for input locations
    const inputLocationMarkers: Array<{
      lat: number;
      lng: number;
      title: string;
      icon: string;
    }> = [];
    if (midpointData?.inputLocations) {
      midpointData.inputLocations.forEach((location: any) => {
        if (location.coordinates?.lat && location.coordinates?.lng) {
          inputLocationMarkers.push({
            lat: location.coordinates.lat,
            lng: location.coordinates.lng,
            title: location.name || "Input Location",
            icon: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
          });
        }
      });
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              html, body { 
                width: 100%; 
                height: 100%; 
                margin: 0; 
                padding: 0; 
                overflow: hidden;
              }
              #map { 
                width: 100%; 
                height: 100vh; 
                min-height: 200px;
              }
            </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            function initMap() {
              console.log('🗺️ Initializing Google Maps...');
              const center = { lat: ${center.lat}, lng: ${center.lng} };
              const mapElement = document.getElementById('map');
              
              if (!mapElement) {
                console.error('❌ Map element not found!');
                return;
              }
              
              console.log('📍 Center:', center);
              const map = new google.maps.Map(mapElement, {
                zoom: 13,
                center: center,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                gestureHandling: 'greedy'
              });
              
              console.log('✅ Map initialized successfully');

              // Add midpoint marker
              new google.maps.Marker({
                position: center,
                map: map,
                title: 'Midpoint',
                icon: {
                  url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                  scaledSize: new google.maps.Size(40, 40)
                }
              });

              // Add star markers for input locations
              const inputLocationMarkers = ${JSON.stringify(
                inputLocationMarkers
              )};
              inputLocationMarkers.forEach(marker => {
                // Create a custom star icon using SVG
                const starIcon = {
                  path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
                  fillColor: '#FFD700',
                  fillOpacity: 1,
                  strokeColor: '#FFA500',
                  strokeWeight: 2,
                  scale: 1.2,
                  anchor: new google.maps.Point(12, 12)
                };
                
                new google.maps.Marker({
                  position: { lat: marker.lat, lng: marker.lng },
                  map: map,
                  title: marker.title,
                  icon: starIcon
                });
              });

              // Add place markers (restaurants, cafes, etc.)
              const placeMarkers = ${JSON.stringify(placeMarkers)};
              placeMarkers.forEach(marker => {
                new google.maps.Marker({
                  position: { lat: marker.lat, lng: marker.lng },
                  map: map,
                  title: marker.title,
                  icon: marker.icon
                });
              });

              // Fit bounds to show all markers
              const allMarkers = [...inputLocationMarkers, ...placeMarkers];
              if (allMarkers.length > 0) {
                const bounds = new google.maps.LatLngBounds();
                bounds.extend(center);
                allMarkers.forEach(m => bounds.extend({ lat: m.lat, lng: m.lng }));
                map.fitBounds(bounds);
              }
            }
          </script>
          <script async defer
            src="https://maps.googleapis.com/maps/api/js?key=${key}&callback=initMap">
          </script>
          <script>
            // Error handling
            window.addEventListener('error', function(e) {
              console.error('❌ Map error:', e.message, e.filename, e.lineno);
              const mapEl = document.getElementById('map');
              if (mapEl) {
                mapEl.innerHTML = '<div style="padding: 20px; text-align: center; color: #f00; background: #fee;">Error: ' + e.message + '</div>';
              }
            });
            
            // Log when Google Maps script loads
            window.gm_authFailure = function() {
              console.error('❌ Google Maps authentication failed - check your API key');
              const mapEl = document.getElementById('map');
              if (mapEl) {
                mapEl.innerHTML = '<div style="padding: 20px; text-align: center; color: #f00; background: #fee;">Google Maps API Key Error - Please check your API key</div>';
              }
            };
            
            // Timeout fallback
            setTimeout(function() {
              if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
                console.error('❌ Google Maps failed to load after 10 seconds');
                const mapEl = document.getElementById('map');
                if (mapEl) {
                  mapEl.innerHTML = '<div style="padding: 20px; text-align: center; color: #666; background: #f0f0f0;">Failed to load Google Maps. Please check your API key and internet connection.</div>';
                }
              }
            }, 10000);
            
            // Debug: Log script loading
            console.log('🗺️ Google Maps script tag added, waiting for callback...');
          </script>
        </body>
      </html>
    `;
  }, [center, midpointData, apiKey]);

  // Get places from midpoint data or use empty array
  const places = midpointData?.places || [];

  // Helper function to open Google Maps
  const openGoogleMaps = (place: any) => {
    if (place.coordinates?.lat && place.coordinates?.lng) {
      const url = `https://www.google.com/maps/search/?api=1&query=${place.coordinates.lat},${place.coordinates.lng}`;
      Linking.openURL(url).catch((err) => {
        console.error("Failed to open Google Maps:", err);
      });
    } else if (place.place_id) {
      const url = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
      Linking.openURL(url).catch((err) => {
        console.error("Failed to open Google Maps:", err);
      });
    }
  };

  // Helper to format distance
  const formatDistance = (distanceMeters: number | undefined) => {
    if (!distanceMeters) return "";
    if (distanceMeters < 1000) {
      return `${Math.round(distanceMeters)} m`;
    }
    return `${(distanceMeters / 1000).toFixed(1)} km`;
  };

  const handleShare = () => {
    successHaptic();
    // Navigate to poll page to save midpoint
    router.push({
      pathname: "/poll",
      params: {
        midpointData: params.midpointData || JSON.stringify(midpointData),
        activity: activity,
        selectedFriends: params.selectedFriends || JSON.stringify([]),
      },
    });
  };

  const handleRestaurantPress = (place: any) => {
    successHaptic();
    router.push({
      pathname: "/event-detail",
      params: {
        restaurantName: place.name,
        restaurantAddress: place.address,
        restaurantPlaceId: place.place_id,
        restaurantCoordinates: JSON.stringify(place.coordinates),
        restaurantRating: place.rating?.toString() || "",
        restaurantDistance: place.distance?.toString() || "",
        isNewEvent: "true",
        selectedFriends: params.selectedFriends || JSON.stringify([]),
      },
    });
  };

  const [displayedCount, setDisplayedCount] = React.useState(10);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isNearBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;

    if (isNearBottom && displayedCount < places.length) {
      // Load 10 more places
      setDisplayedCount((prev: number) => Math.min(prev + 10, places.length));
    }
  };

  const displayedPlaces = places.slice(0, displayedCount);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        {/* Minimal Header - Floating over map */}
        <View style={styles.minimalHeader}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButtonMinimal,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <ArrowLeft size={24} color={colors.foreground} />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.minimalHeaderTitle} numberOfLines={1}>
              Midpoint Found
            </Text>
          </View>
          {places.length > 0 && (
            <View style={styles.placesCountBadge}>
              <Text style={styles.placesCountText}>{places.length}</Text>
            </View>
          )}
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [
              styles.shareHeaderButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Share2 size={20} color={colors.primary} />
          </Pressable>
        </View>

        {/* Full Screen Map */}
        <View style={styles.mapContainer}>
          <WebView
            source={{ html: mapHtml }}
            style={styles.map}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            originWhitelist={["*"]}
            mixedContentMode="always"
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error("WebView error:", nativeEvent);
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error("WebView HTTP error:", nativeEvent.statusCode);
            }}
            onLoadEnd={() => {
              console.log("🗺️ Map WebView loaded");
            }}
          />
        </View>

        {/* Floating Places Sheet at Bottom */}
        {places.length > 0 && (
          <View
            style={[
              styles.placesSheet,
              !sheetExpanded && styles.placesSheetCollapsed,
            ]}
          >
            <View style={styles.placesSheetContent}>
              {/* Drag Handle - Pressable to toggle */}
              <Pressable
                onPress={() => {
                  setSheetExpanded(!sheetExpanded);
                  successHaptic();
                }}
                style={styles.dragHandleContainer}
              >
                <View style={styles.dragHandle} />
                {sheetExpanded ? (
                  <ChevronDown
                    size={20}
                    color={colors.icon.muted}
                    style={styles.chevronIcon}
                  />
                ) : (
                  <ChevronUp
                    size={20}
                    color={colors.icon.muted}
                    style={styles.chevronIcon}
                  />
                )}
              </Pressable>

              {/* Section Header - Fixed and Pressable */}
              <Pressable
                onPress={() => {
                  setSheetExpanded(!sheetExpanded);
                  successHaptic();
                }}
                style={styles.sectionHeader}
              >
                <Text style={styles.sectionTitle}>Nearby Places</Text>
                <View style={styles.sectionHeaderRight}>
                  <View style={styles.placesBadge}>
                    <Text style={styles.placesBadgeText}>
                      {places.length} places
                    </Text>
                  </View>
                  {sheetExpanded ? (
                    <ChevronDown size={20} color={colors.icon.muted} />
                  ) : (
                    <ChevronUp size={20} color={colors.icon.muted} />
                  )}
                </View>
              </Pressable>

              {/* Places List - Scrollable - Only show when expanded */}
              {sheetExpanded && (
                <>
                  <ScrollView
                    style={styles.placesScrollView}
                    contentContainerStyle={styles.placesScrollContent}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                  >
                    {/* Place Cards */}
                    {displayedPlaces.map((place: any, index: number) => (
                      <Pressable
                        key={place.place_id || index}
                        onPress={() => handleRestaurantPress(place)}
                        style={({ pressed }) => [
                          styles.restaurantCard,
                          { opacity: pressed ? 0.8 : 1 },
                        ]}
                      >
                        {/* Place Image */}
                        {place.photos &&
                          place.photos.length > 0 &&
                          place.photos[0].url && (
                            <Image
                              source={{ uri: place.photos[0].url }}
                              style={styles.placeImage}
                              resizeMode="cover"
                            />
                          )}

                        {/* Place Header */}
                        <View style={styles.restaurantHeader}>
                          <View style={styles.nameContainer}>
                            <Text
                              style={styles.restaurantName}
                              numberOfLines={2}
                            >
                              {place.name || "Unknown Place"}
                            </Text>
                            {place.rating && (
                              <View style={styles.ratingContainer}>
                                <Star
                                  size={16}
                                  color={colors.primary}
                                  fill={colors.primary}
                                />
                                <Text style={styles.ratingText}>
                                  {place.rating.toFixed(1)}
                                </Text>
                              </View>
                            )}
                          </View>
                          {/* Google Maps Link */}
                          <Pressable
                            onPress={() => openGoogleMaps(place)}
                            style={({ pressed }) => [
                              styles.mapsButton,
                              { opacity: pressed ? 0.7 : 1 },
                            ]}
                          >
                            <ExternalLink size={20} color={colors.primary} />
                          </Pressable>
                        </View>

                        {/* Place Details */}
                        {place.address && (
                          <View style={styles.restaurantDetails}>
                            <View style={styles.detailRow}>
                              <MapPin size={16} color={colors.icon.muted} />
                              <Text style={styles.detailText} numberOfLines={2}>
                                {place.address}
                              </Text>
                            </View>
                            {place.distance && (
                              <View style={styles.detailRow}>
                                <Navigation
                                  size={16}
                                  color={colors.icon.muted}
                                />
                                <Text style={styles.detailText}>
                                  {formatDistance(place.distance)}
                                </Text>
                              </View>
                            )}
                          </View>
                        )}
                      </Pressable>
                    ))}
                  </ScrollView>
                </>
              )}
            </View>
          </View>
        )}
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
    position: "relative",
  },
  // Minimal Header - Floating over map
  minimalHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonMinimal: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    marginRight: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitleContainer: {
    flex: 1,
  },
  minimalHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.foreground,
  },
  placesCountBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  placesCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.white,
  },
  // Full Screen Map
  mapContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  map: {
    width: "100%",
    height: "100%",
    backgroundColor: colorOpacity.secondary["10"],
  },
  // Floating Places Sheet
  placesSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: SCREEN_HEIGHT * 0.65,
    maxHeight: SCREEN_HEIGHT * 0.65,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 50,
    overflow: "hidden",
  },
  placesSheetCollapsed: {
    height: 100,
    maxHeight: 100,
  },
  placesSheetContent: {
    flex: 1,
    flexDirection: "column",
    height: "100%",
  },
  dragHandleContainer: {
    alignItems: "center",
    paddingVertical: 8,
    flexShrink: 0,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 4,
  },
  chevronIcon: {
    marginTop: 4,
  },
  placesScrollView: {
    flex: 1,
    minHeight: 0,
  },
  placesScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  restaurantsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexShrink: 0,
  },
  sectionHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.foreground,
  },
  placesBadge: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  placesBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.white,
  },
  restaurantCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  placeImage: {
    width: "100%",
    height: 180,
    backgroundColor: colorOpacity.secondary["10"],
  },
  nameContainer: {
    flex: 1,
    marginRight: 12,
  },
  mapsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colorOpacity.primary["10"],
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.mutedForeground,
    textAlign: "center",
  },
  restaurantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    paddingBottom: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.foreground,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 12,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.foreground,
  },
  restaurantDetails: {
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  peopleGoingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  peopleAvatars: {
    flexDirection: "row",
    gap: -8,
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.muted,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.card,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.foreground,
  },
  peopleGoingText: {
    fontSize: 14,
    color: colors.mutedForeground,
    flex: 1,
  },
  shareButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexShrink: 0,
  },
  bottomShareButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    zIndex: 50,
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
  shareButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
  },
  shareHeaderButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    marginLeft: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
