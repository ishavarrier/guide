import { useState, useEffect, useCallback } from "react";
import PlacesService, { PlacePrediction } from "../services/PlacesService";

interface UseLocationSearchOptions {
  debounceMs?: number;
  minLength?: number;
}

export const useLocationSearch = (options: UseLocationSearchOptions = {}) => {
  const { debounceMs = 300, minLength = 2 } = options;

  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Generate session token on mount
  useEffect(() => {
    setSessionToken(Math.random().toString(36).substring(2, 15));
  }, []);

  const searchPlaces = useCallback(
    async (searchInput: string) => {
      if (searchInput.length < minLength) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const results = await PlacesService.getPlaceAutocomplete(
          searchInput,
          sessionToken || undefined
        );
        setSuggestions(results);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Search failed";
        setError(errorMessage);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionToken, minLength]
  );

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (input.trim()) {
        searchPlaces(input);
      } else {
        setSuggestions([]);
        setError(null);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [input, searchPlaces, debounceMs]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  const selectSuggestion = useCallback((suggestion: PlacePrediction) => {
    setInput(suggestion.description);
    setSuggestions([]);
  }, []);

  return {
    input,
    setInput,
    suggestions,
    isLoading,
    error,
    clearSuggestions,
    selectSuggestion,
  };
};
