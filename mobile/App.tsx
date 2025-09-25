import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import Constants from "expo-constants";

type Coordinates = { lat: number; lng: number };
type Place = {
  place_id: string;
  name: string;
  address: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  photos?: { url: string }[];
  types: string[];
  distance: number;
  coordinates: Coordinates;
};

type MidpointResponse = {
  midpoint: Coordinates;
  midpointAddress: string;
  places: Place[];
};

const apiBaseUrl =
  (Constants.expoConfig?.extra as any)?.apiBaseUrl || "http://localhost:3000";

export default function App() {
  const [location1, setLocation1] = useState("");
  const [location2, setLocation2] = useState("");
  const [results, setResults] = useState<MidpointResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapRegion = useMemo(() => {
    if (!results) return undefined;
    return {
      latitude: results.midpoint.lat,
      longitude: results.midpoint.lng,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }, [results]);

  const onSearch = async () => {
    setIsSearching(true);
    setError(null);
    try {
      // Geocode via Google Maps Geocoding API on device (requires browser key)
      const key = (Constants.expoConfig?.extra as any)?.googlePlacesApiKey;
      const fetchCoords = async (address: string): Promise<Coordinates> => {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${key}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.status !== "OK" || !json.results?.[0]) {
          throw new Error(`Could not geocode: ${address}`);
        }
        const loc = json.results[0].geometry.location;
        return { lat: loc.lat, lng: loc.lng };
      };

      const [coord1, coord2] = await Promise.all([
        fetchCoords(location1),
        fetchCoords(location2),
      ]);

      const payload = { coord1, coord2, filters: [] };
      const res = await fetch(`${apiBaseUrl}/api/midpoint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to fetch midpoint");
      }
      const data: MidpointResponse = await res.json();
      setResults(data);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MidpointGuide</Text>
        <Text style={styles.subtitle}>
          Find places at your perfect midpoint
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          placeholder="First location"
          style={styles.input}
          value={location1}
          onChangeText={setLocation1}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Second location"
          style={styles.input}
          value={location2}
          onChangeText={setLocation2}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={onSearch}
          disabled={isSearching}
        >
          <Text style={styles.buttonText}>
            {isSearching ? "Searching..." : "Find Midpoint Places"}
          </Text>
        </TouchableOpacity>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      {results && (
        <>
          <View style={styles.mapWrapper}>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={mapRegion}
              region={mapRegion}
            >
              {/* Midpoint marker */}
              <Marker
                coordinate={{
                  latitude: results.midpoint.lat,
                  longitude: results.midpoint.lng,
                }}
                title="Midpoint"
                pinColor="#EF4444"
              />
              {/* Radius circle 5km */}
              <Circle
                center={{
                  latitude: results.midpoint.lat,
                  longitude: results.midpoint.lng,
                }}
                radius={5000}
                strokeColor="#3B82F6"
                fillColor="rgba(59,130,246,0.1)"
                strokeWidth={2}
              />
              {/* Places markers */}
              {results.places.map((p) => (
                <Marker
                  key={p.place_id}
                  coordinate={{
                    latitude: p.coordinates.lat,
                    longitude: p.coordinates.lng,
                  }}
                  title={p.name}
                  description={p.address}
                  pinColor="#F59E0B"
                />
              ))}
            </MapView>
          </View>

          <FlatList
            data={results.places}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                {item.photos?.[0]?.url ? (
                  <Image
                    source={{ uri: item.photos[0].url }}
                    style={styles.cardImage}
                  />
                ) : null}
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardAddress}>{item.address}</Text>
                  <View style={styles.cardMetaRow}>
                    {typeof item.rating === "number" && (
                      <Text style={styles.cardMeta}>
                        ⭐ {item.rating.toFixed(1)}
                      </Text>
                    )}
                    <Text style={styles.cardMeta}>
                      {item.distance.toFixed(1)} mi
                    </Text>
                  </View>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { color: "#6b7280" },
  form: { paddingHorizontal: 16, paddingBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#f97316",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  error: { color: "#ef4444", marginTop: 8 },
  mapWrapper: { height: 260, margin: 16, borderRadius: 12, overflow: "hidden" },
  map: { flex: 1 },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  cardImage: { width: "100%", height: 160 },
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  cardAddress: { color: "#6b7280", marginBottom: 6 },
  cardMetaRow: { flexDirection: "row", gap: 12 },
  cardMeta: { color: "#374151" },
  listContent: { paddingBottom: 24 },
});



