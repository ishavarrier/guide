import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MapPin, X } from "lucide-react-native";
import { useLocationSearch } from "../hooks/useLocationSearch";
import { PlacePrediction } from "../services/PlacesService";
import { colors, colorOpacity } from "../constants/theme";

interface LocationInputWithAutocompleteProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSelectPlace?: (place: PlacePrediction) => void;
  style?: any;
  autoComplete?: string;
}

export const LocationInputWithAutocomplete: React.FC<
  LocationInputWithAutocompleteProps
> = ({
  placeholder = "Enter location or address",
  value,
  onChangeText,
  onSelectPlace,
  style,
  autoComplete,
}) => {
  const {
    input,
    setInput,
    suggestions,
    isLoading,
    error,
    clearSuggestions,
    selectSuggestion,
  } = useLocationSearch({
    debounceMs: 300,
    minLength: 2,
  });

  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sync external value with internal input
  React.useEffect(() => {
    if (value !== input) {
      setInput(value);
    }
  }, [value]);

  const handleInputChange = (text: string) => {
    setInput(text);
    onChangeText(text);
    setShowSuggestions(text.length >= 2);
  };

  const handleSelectSuggestion = (suggestion: PlacePrediction) => {
    selectSuggestion(suggestion);
    onChangeText(suggestion.description);
    setShowSuggestions(false);
    onSelectPlace?.(suggestion);
  };

  const handleClear = () => {
    setInput("");
    onChangeText("");
    clearSuggestions();
    setShowSuggestions(false);
  };

  const renderSuggestion = ({ item }: { item: PlacePrediction }) => {
    // Defensive checks for structured_formatting
    const mainText =
      item.structured_formatting?.main_text ||
      item.description ||
      "Unknown location";
    const secondaryText = item.structured_formatting?.secondary_text;

    return (
      <Pressable
        style={styles.suggestionItem}
        onPress={() => handleSelectSuggestion(item)}
      >
        <View style={styles.suggestionContent}>
          <MapPin size={16} color={colors.icon.muted} />
          <View style={styles.suggestionText}>
            <Text style={styles.mainText}>{mainText}</Text>
            {secondaryText && (
              <Text style={styles.secondaryText}>{secondaryText}</Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, style]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={input}
          onChangeText={handleInputChange}
          onFocus={() => setShowSuggestions(input.length >= 2)}
          autoComplete={autoComplete as any}
          placeholderTextColor={colors.mutedForeground}
        />
        {input.length > 0 && (
          <Pressable onPress={handleClear} style={styles.clearButton}>
            <X size={16} color={colors.icon.muted} />
          </Pressable>
        )}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.secondary} />
          </View>
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
          >
            {suggestions.map((item, index) => {
              // Debug logging
              if (index === 0) {
                console.log(
                  "🔍 First suggestion data:",
                  JSON.stringify(item, null, 2)
                );
                console.log("  - place_id:", item.place_id);
                console.log("  - description:", item.description);
                console.log(
                  "  - structured_formatting:",
                  item.structured_formatting
                );
                console.log(
                  "  - main_text:",
                  item.structured_formatting?.main_text
                );
                console.log(
                  "  - secondary_text:",
                  item.structured_formatting?.secondary_text
                );
              }
              return (
                <View key={item.place_id}>{renderSuggestion({ item })}</View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colorOpacity.secondary["30"],
    borderRadius: 8,
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 12,
    minHeight: 40,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.foreground,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 4,
    marginLeft: 8,
  },
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    maxHeight: 200,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.muted,
  },
  suggestionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  suggestionText: {
    marginLeft: 8,
    flex: 1,
  },
  mainText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.foreground,
  },
  secondaryText: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    color: colors.destructive,
    marginTop: 4,
  },
});
